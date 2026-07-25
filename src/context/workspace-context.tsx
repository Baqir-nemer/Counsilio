"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  tryGetCounsilio,
  type IndexProgress,
  type IndexStats,
  type SearchHit,
  type TreeEntry,
} from "@/lib/workspace-bridge";

type WorkspaceContextValue = {
  ready: boolean;
  isDesktop: boolean;
  workspacePath: string | null;
  stats: IndexStats | null;
  progress: IndexProgress | null;
  hasWorkspace: boolean;
  pickWorkspace: () => Promise<string | null>;
  reindex: () => Promise<void>;
  listDir: (dirPath?: string) => Promise<TreeEntry[]>;
  search: (query: string, limit?: number) => Promise<SearchHit[]>;
  fuzzyFiles: (query: string) => Promise<{ path: string; title: string }[]>;
  readText: (
    filePath: string
  ) => Promise<{ path: string; text: string; title: string }>;
  reveal: (filePath: string) => Promise<void>;
  openFile: (filePath: string) => Promise<void>;
  pathForDrop: (file: File) => string | null;
  refresh: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const emptyStats: IndexStats = {
  fileCount: 0,
  chunkCount: 0,
  updatedAt: null,
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);
  const [stats, setStats] = useState<IndexStats | null>(null);
  const [progress, setProgress] = useState<IndexProgress | null>(null);
  const isDesktop = typeof window !== "undefined" && Boolean(window.counsilio);

  const refresh = useCallback(async () => {
    const api = tryGetCounsilio();
    if (!api) {
      setWorkspacePath(null);
      setStats(null);
      return;
    }
    const settings = await api.getSettings();
    setWorkspacePath(settings.workspacePath);
    if (settings.workspacePath) {
      setStats(await api.getStats());
    } else {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      await refresh();
      if (cancelled) return;
      setReady(true);
      const api = tryGetCounsilio();
      if (api) {
        unsubscribe = api.onIndexProgress((p) => {
          setProgress(p);
          if (p.phase === "done") {
            void api.getStats().then(setStats);
          }
        });
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [refresh]);

  const pickWorkspace = useCallback(async () => {
    const api = tryGetCounsilio();
    if (!api) return null;
    const result = await api.pickWorkspace();
    if (!result) return null;
    setWorkspacePath(result.path);
    setStats(result.stats);
    return result.path;
  }, []);

  const reindex = useCallback(async () => {
    const api = tryGetCounsilio();
    if (!api) return;
    const next = await api.reindex();
    setStats(next);
  }, []);

  const listDir = useCallback(async (dirPath?: string) => {
    const api = tryGetCounsilio();
    if (!api) return [];
    return api.listDir(dirPath);
  }, []);

  const search = useCallback(async (query: string, limit?: number) => {
    const api = tryGetCounsilio();
    if (!api) return [];
    return api.search(query, limit);
  }, []);

  const fuzzyFiles = useCallback(async (query: string) => {
    const api = tryGetCounsilio();
    if (!api) return [];
    return api.fuzzyFiles(query);
  }, []);

  const readText = useCallback(async (filePath: string) => {
    const api = tryGetCounsilio();
    if (!api) throw new Error("Desktop required");
    return api.readText(filePath);
  }, []);

  const reveal = useCallback(async (filePath: string) => {
    const api = tryGetCounsilio();
    if (!api) return;
    await api.reveal(filePath);
  }, []);

  const openFile = useCallback(async (filePath: string) => {
    const api = tryGetCounsilio();
    if (!api) return;
    await api.openFile(filePath);
  }, []);

  const pathForDrop = useCallback((file: File) => {
    const api = tryGetCounsilio();
    if (!api) return null;
    try {
      return api.pathForDrop(file) || null;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      ready,
      isDesktop,
      workspacePath,
      stats: stats ?? emptyStats,
      progress,
      hasWorkspace: Boolean(workspacePath),
      pickWorkspace,
      reindex,
      listDir,
      search,
      fuzzyFiles,
      readText,
      reveal,
      openFile,
      pathForDrop,
      refresh,
    }),
    [
      ready,
      isDesktop,
      workspacePath,
      stats,
      progress,
      pickWorkspace,
      reindex,
      listDir,
      search,
      fuzzyFiles,
      readText,
      reveal,
      openFile,
      pathForDrop,
      refresh,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
