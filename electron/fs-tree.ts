import fs from "node:fs/promises";
import path from "node:path";
import { assertWithinRoot } from "./paths";

export type TreeEntry = {
  name: string;
  path: string;
  isDirectory: boolean;
};

const SKIP_DIRS = new Set([
  ".counsilio",
  ".git",
  "node_modules",
  ".next",
  "dist",
  "dist-electron",
  ".DS_Store",
]);

export async function listDirectory(
  workspaceRoot: string,
  dirPath?: string
): Promise<TreeEntry[]> {
  const target = dirPath
    ? assertWithinRoot(workspaceRoot, dirPath)
    : path.resolve(workspaceRoot);

  const entries = await fs.readdir(target, { withFileTypes: true });
  const result: TreeEntry[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".counsilio") {
      // hide dotfiles except we skip .counsilio entirely below
    }
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) {
      continue;
    }
    const full = path.join(target, entry.name);
    result.push({
      name: entry.name,
      path: full,
      isDirectory: entry.isDirectory(),
    });
  }

  result.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return result;
}
