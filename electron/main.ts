import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  protocol,
  shell,
  net,
} from "electron";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  clearAll,
  getProfile,
  getWorkspacePath,
  setProfile,
  setWorkspacePath,
  type UserProfile,
} from "./store";
import { listDirectory } from "./fs-tree";
import {
  buildIndex,
  indexStats,
  loadIndex,
  type IndexProgress,
  type WorkspaceIndex,
} from "./indexer";
import { extractText } from "./extractors";
import { fuzzyFileNames, searchIndex } from "./search";
import { assertWithinRoot, isWithinRoot } from "./paths";

const isDev = process.env.ELECTRON_DEV === "1";

let mainWindow: BrowserWindow | null = null;
let cachedIndex: WorkspaceIndex | null = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

function sendProgress(progress: IndexProgress) {
  mainWindow?.webContents.send("workspace:index-progress", progress);
}

async function refreshIndex(workspacePath: string): Promise<WorkspaceIndex> {
  cachedIndex = await buildIndex(workspacePath, sendProgress);
  return cachedIndex;
}

async function ensureIndex(): Promise<WorkspaceIndex | null> {
  const workspace = getWorkspacePath();
  if (!workspace) return null;
  if (cachedIndex && cachedIndex.workspacePath === workspace) {
    return cachedIndex;
  }
  cachedIndex = await loadIndex(workspace);
  return cachedIndex;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: "Counsilio",
    backgroundColor: "#f6f1e8",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    // Use localhost (not 127.0.0.1) so Next.js HMR/fonts match the dev host.
    void mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    void mainWindow.loadURL("app://-/");
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function registerIpc() {
  ipcMain.handle("settings:get", () => ({
    profile: getProfile(),
    workspacePath: getWorkspacePath(),
  }));

  ipcMain.handle("profile:get", () => getProfile());

  ipcMain.handle("profile:set", (_e, profile: UserProfile | null) => {
    return setProfile(profile);
  });

  ipcMain.handle("profile:clear", () => {
    clearAll();
    cachedIndex = null;
    return null;
  });

  ipcMain.handle("workspace:get", () => getWorkspacePath());

  ipcMain.handle("workspace:pick", async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ["openDirectory", "createDirectory"],
      title: "Choose Counsilio workspace folder",
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const chosen = path.resolve(result.filePaths[0]);
    setWorkspacePath(chosen);
    cachedIndex = null;
    await refreshIndex(chosen);
    return {
      path: chosen,
      stats: indexStats(cachedIndex),
    };
  });

  ipcMain.handle("workspace:set", async (_e, workspacePath: string) => {
    const chosen = path.resolve(workspacePath);
    if (!fs.existsSync(chosen) || !fs.statSync(chosen).isDirectory()) {
      throw new Error("Workspace path is not a directory");
    }
    setWorkspacePath(chosen);
    cachedIndex = null;
    await refreshIndex(chosen);
    return {
      path: chosen,
      stats: indexStats(cachedIndex),
    };
  });

  ipcMain.handle("workspace:reindex", async () => {
    const workspace = getWorkspacePath();
    if (!workspace) throw new Error("No workspace selected");
    await refreshIndex(workspace);
    return indexStats(cachedIndex);
  });

  ipcMain.handle("workspace:stats", async () => {
    const index = await ensureIndex();
    return indexStats(index);
  });

  ipcMain.handle("workspace:list", async (_e, dirPath?: string) => {
    const workspace = getWorkspacePath();
    if (!workspace) return [];
    return listDirectory(workspace, dirPath);
  });

  ipcMain.handle("workspace:search", async (_e, query: string, limit?: number) => {
    const index = await ensureIndex();
    return searchIndex(index, query, limit ?? 8);
  });

  ipcMain.handle("workspace:fuzzy", async (_e, query: string) => {
    const index = await ensureIndex();
    return fuzzyFileNames(index, query);
  });

  ipcMain.handle("files:read-text", async (_e, filePath: string) => {
    const workspace = getWorkspacePath();
    if (!workspace) throw new Error("No workspace");
    // allow absolute paths that are inside workspace, or explicitly dropped files anywhere
    const resolved = path.resolve(filePath);
    if (!isWithinRoot(workspace, resolved)) {
      // dropped files outside workspace are allowed once
      if (!fs.existsSync(resolved)) throw new Error("File not found");
    } else {
      assertWithinRoot(workspace, resolved);
    }
    const text = await extractText(resolved);
    return { path: resolved, text, title: path.basename(resolved) };
  });

  ipcMain.handle("files:reveal", async (_e, filePath: string) => {
    shell.showItemInFolder(path.resolve(filePath));
    return true;
  });

  ipcMain.handle("files:open", async (_e, filePath: string) => {
    await shell.openPath(path.resolve(filePath));
    return true;
  });
}

app.whenReady().then(() => {
  protocol.handle("app", (request) => {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/" || pathname === "") pathname = "/index.html";
    if (pathname.endsWith("/")) pathname = `${pathname}index.html`;

    const outDir = path.join(app.getAppPath(), "out");
    let filePath = path.join(outDir, pathname);
    // try .html fallback for next trailingSlash routes
    if (!fs.existsSync(filePath)) {
      const alt = path.join(outDir, pathname.replace(/\/$/, "") + ".html");
      if (fs.existsSync(alt)) filePath = alt;
    }
    return net.fetch(pathToFileURL(filePath).toString());
  });

  registerIpc();
  createWindow();

  // warm index if workspace already set
  const existing = getWorkspacePath();
  if (existing) {
    void loadIndex(existing).then((idx) => {
      cachedIndex = idx;
    });
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
