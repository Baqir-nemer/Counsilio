import { contextBridge, ipcRenderer, webUtils } from "electron";

export type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  languageCode: string;
  role: string;
  acceptedDisclaimer: boolean;
  onboardedAt: string;
};

export type IndexProgress = {
  phase: "scanning" | "extracting" | "done" | "error";
  current?: string;
  processed: number;
  total: number;
  message?: string;
};

export type TreeEntry = {
  name: string;
  path: string;
  isDirectory: boolean;
};

export type SearchHit = {
  path: string;
  title: string;
  snippet: string;
  score: number;
  page?: number;
  chunkId: string;
};

export type IndexStats = {
  fileCount: number;
  chunkCount: number;
  updatedAt: string | null;
};

const api = {
  isDesktop: true as const,

  getSettings: (): Promise<{
    profile: UserProfile | null;
    workspacePath: string | null;
  }> => ipcRenderer.invoke("settings:get"),

  getProfile: (): Promise<UserProfile | null> =>
    ipcRenderer.invoke("profile:get"),

  setProfile: (profile: UserProfile | null): Promise<UserProfile | null> =>
    ipcRenderer.invoke("profile:set", profile),

  clearProfile: (): Promise<null> => ipcRenderer.invoke("profile:clear"),

  getWorkspace: (): Promise<string | null> =>
    ipcRenderer.invoke("workspace:get"),

  pickWorkspace: (): Promise<{
    path: string;
    stats: IndexStats;
  } | null> => ipcRenderer.invoke("workspace:pick"),

  setWorkspace: (
    workspacePath: string
  ): Promise<{ path: string; stats: IndexStats }> =>
    ipcRenderer.invoke("workspace:set", workspacePath),

  reindex: (): Promise<IndexStats> => ipcRenderer.invoke("workspace:reindex"),

  getStats: (): Promise<IndexStats> => ipcRenderer.invoke("workspace:stats"),

  listDir: (dirPath?: string): Promise<TreeEntry[]> =>
    ipcRenderer.invoke("workspace:list", dirPath),

  search: (query: string, limit?: number): Promise<SearchHit[]> =>
    ipcRenderer.invoke("workspace:search", query, limit),

  fuzzyFiles: (
    query: string
  ): Promise<{ path: string; title: string }[]> =>
    ipcRenderer.invoke("workspace:fuzzy", query),

  readText: (
    filePath: string
  ): Promise<{ path: string; text: string; title: string }> =>
    ipcRenderer.invoke("files:read-text", filePath),

  reveal: (filePath: string): Promise<boolean> =>
    ipcRenderer.invoke("files:reveal", filePath),

  openFile: (filePath: string): Promise<boolean> =>
    ipcRenderer.invoke("files:open", filePath),

  pathForDrop: (file: File): string => webUtils.getPathForFile(file),

  onIndexProgress: (cb: (progress: IndexProgress) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, progress: IndexProgress) =>
      cb(progress);
    ipcRenderer.on("workspace:index-progress", listener);
    return () => ipcRenderer.removeListener("workspace:index-progress", listener);
  },
};

contextBridge.exposeInMainWorld("counsilio", api);

export type CounsilioApi = typeof api;
