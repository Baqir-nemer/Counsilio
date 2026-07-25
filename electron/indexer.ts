import fs from "node:fs/promises";
import path from "node:path";
import { extractText, isIndexable } from "./extractors";

export type IndexChunk = {
  id: string;
  path: string;
  title: string;
  text: string;
  page?: number;
  start: number;
  end: number;
};

export type IndexedFile = {
  path: string;
  mtimeMs: number;
  size: number;
  chunkIds: string[];
};

export type WorkspaceIndex = {
  version: 1;
  workspacePath: string;
  updatedAt: string;
  files: Record<string, IndexedFile>;
  chunks: Record<string, IndexChunk>;
};

export type IndexProgress = {
  phase: "scanning" | "extracting" | "done" | "error";
  current?: string;
  processed: number;
  total: number;
  message?: string;
};

const SKIP_DIRS = new Set([
  ".counsilio",
  ".git",
  "node_modules",
  ".next",
  "dist",
  "dist-electron",
  "release",
  "out",
]);

const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 150;

function indexDir(workspacePath: string): string {
  return path.join(workspacePath, ".counsilio");
}

function indexFile(workspacePath: string): string {
  return path.join(indexDir(workspacePath), "index.json");
}

export async function loadIndex(
  workspacePath: string
): Promise<WorkspaceIndex | null> {
  try {
    const raw = await fs.readFile(indexFile(workspacePath), "utf8");
    return JSON.parse(raw) as WorkspaceIndex;
  } catch {
    return null;
  }
}

async function saveIndex(index: WorkspaceIndex): Promise<void> {
  const dir = indexDir(index.workspacePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(indexFile(index.workspacePath), JSON.stringify(index), "utf8");
}

async function walkFiles(root: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(dir: string) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && isIndexable(full)) {
        results.push(full);
      }
    }
  }

  await walk(root);
  return results;
}

function chunkText(text: string, filePath: string): IndexChunk[] {
  const title = path.basename(filePath);
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks: IndexChunk[] = [];
  let start = 0;
  let i = 0;
  while (start < normalized.length) {
    const end = Math.min(start + CHUNK_SIZE, normalized.length);
    const slice = normalized.slice(start, end);
    chunks.push({
      id: `${filePath}#${i}`,
      path: filePath,
      title,
      text: slice,
      start,
      end,
    });
    i += 1;
    if (end >= normalized.length) break;
    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }
  return chunks;
}

export async function buildIndex(
  workspacePath: string,
  onProgress?: (p: IndexProgress) => void
): Promise<WorkspaceIndex> {
  const root = path.resolve(workspacePath);
  const existing = (await loadIndex(root)) ?? {
    version: 1 as const,
    workspacePath: root,
    updatedAt: new Date().toISOString(),
    files: {},
    chunks: {},
  };

  onProgress?.({ phase: "scanning", processed: 0, total: 0 });
  const files = await walkFiles(root);
  onProgress?.({
    phase: "extracting",
    processed: 0,
    total: files.length,
  });

  const nextFiles: Record<string, IndexedFile> = {};
  const nextChunks: Record<string, IndexChunk> = {};
  let processed = 0;

  for (const filePath of files) {
    onProgress?.({
      phase: "extracting",
      current: filePath,
      processed,
      total: files.length,
    });

    let stat;
    try {
      stat = await fs.stat(filePath);
    } catch {
      processed += 1;
      continue;
    }

    const prev = existing.files[filePath];
    if (
      prev &&
      prev.mtimeMs === stat.mtimeMs &&
      prev.size === stat.size &&
      prev.chunkIds.every((id) => existing.chunks[id])
    ) {
      nextFiles[filePath] = prev;
      for (const id of prev.chunkIds) {
        nextChunks[id] = existing.chunks[id];
      }
    } else {
      try {
        const text = await extractText(filePath);
        const chunks = chunkText(text, filePath);
        nextFiles[filePath] = {
          path: filePath,
          mtimeMs: stat.mtimeMs,
          size: stat.size,
          chunkIds: chunks.map((c) => c.id),
        };
        for (const chunk of chunks) {
          nextChunks[chunk.id] = chunk;
        }
      } catch (err) {
        onProgress?.({
          phase: "extracting",
          current: filePath,
          processed,
          total: files.length,
          message: err instanceof Error ? err.message : "Extract failed",
        });
      }
    }

    processed += 1;
  }

  const index: WorkspaceIndex = {
    version: 1,
    workspacePath: root,
    updatedAt: new Date().toISOString(),
    files: nextFiles,
    chunks: nextChunks,
  };

  await saveIndex(index);
  onProgress?.({
    phase: "done",
    processed: files.length,
    total: files.length,
  });
  return index;
}

export function indexStats(index: WorkspaceIndex | null): {
  fileCount: number;
  chunkCount: number;
  updatedAt: string | null;
} {
  if (!index) return { fileCount: 0, chunkCount: 0, updatedAt: null };
  return {
    fileCount: Object.keys(index.files).length,
    chunkCount: Object.keys(index.chunks).length,
    updatedAt: index.updatedAt,
  };
}
