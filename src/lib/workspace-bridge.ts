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

export type CounsilioApi = {
  isDesktop: true;
  getSettings: () => Promise<{
    profile: UserProfile | null;
    workspacePath: string | null;
  }>;
  getProfile: () => Promise<UserProfile | null>;
  setProfile: (profile: UserProfile | null) => Promise<UserProfile | null>;
  clearProfile: () => Promise<null>;
  getWorkspace: () => Promise<string | null>;
  pickWorkspace: () => Promise<{ path: string; stats: IndexStats } | null>;
  setWorkspace: (
    workspacePath: string
  ) => Promise<{ path: string; stats: IndexStats }>;
  reindex: () => Promise<IndexStats>;
  getStats: () => Promise<IndexStats>;
  listDir: (dirPath?: string) => Promise<TreeEntry[]>;
  search: (query: string, limit?: number) => Promise<SearchHit[]>;
  fuzzyFiles: (query: string) => Promise<{ path: string; title: string }[]>;
  readText: (
    filePath: string
  ) => Promise<{ path: string; text: string; title: string }>;
  reveal: (filePath: string) => Promise<boolean>;
  openFile: (filePath: string) => Promise<boolean>;
  pathForDrop: (file: File) => string;
  onIndexProgress: (cb: (progress: IndexProgress) => void) => () => void;
};

declare global {
  interface Window {
    counsilio?: CounsilioApi;
  }
}

export function isDesktop(): boolean {
  return typeof window !== "undefined" && Boolean(window.counsilio?.isDesktop);
}

export function getCounsilio(): CounsilioApi {
  if (typeof window === "undefined" || !window.counsilio) {
    throw new Error(
      "Counsilio desktop APIs are unavailable. Launch with `npm run dev` (Electron)."
    );
  }
  return window.counsilio;
}

export function tryGetCounsilio(): CounsilioApi | null {
  if (typeof window === "undefined") return null;
  return window.counsilio ?? null;
}
