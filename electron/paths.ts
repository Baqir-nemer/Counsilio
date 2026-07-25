import path from "node:path";

/** Resolve and ensure `candidate` stays under `root` (or equals it). */
export function assertWithinRoot(root: string, candidate: string): string {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(candidate);
  const rel = path.relative(resolvedRoot, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Path escapes workspace: ${candidate}`);
  }
  return resolved;
}

export function isWithinRoot(root: string, candidate: string): boolean {
  try {
    assertWithinRoot(root, candidate);
    return true;
  } catch {
    return false;
  }
}
