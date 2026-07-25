import type { IndexChunk, WorkspaceIndex } from "./indexer";

export type SearchHit = {
  path: string;
  title: string;
  snippet: string;
  score: number;
  page?: number;
  chunkId: string;
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/** Offline BM25 over index chunks. */
export function searchIndex(
  index: WorkspaceIndex | null,
  query: string,
  limit = 8
): SearchHit[] {
  if (!index || !query.trim()) return [];

  const chunks = Object.values(index.chunks);
  if (chunks.length === 0) return [];

  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  const N = chunks.length;
  const df = new Map<string, number>();
  const docs = chunks.map((chunk) => {
    const terms = tokenize(chunk.text);
    const tf = new Map<string, number>();
    for (const t of terms) {
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }
    for (const t of new Set(terms)) {
      df.set(t, (df.get(t) ?? 0) + 1);
    }
    return { chunk, terms, tf, len: terms.length };
  });

  const avgdl = docs.reduce((s, d) => s + d.len, 0) / Math.max(N, 1);
  const k1 = 1.5;
  const b = 0.75;

  const scored: SearchHit[] = [];

  for (const doc of docs) {
    let score = 0;
    for (const term of queryTerms) {
      const f = doc.tf.get(term) ?? 0;
      if (f === 0) continue;
      const n = df.get(term) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      const denom = f + k1 * (1 - b + b * (doc.len / avgdl));
      score += idf * ((f * (k1 + 1)) / denom);
    }

    // light title boost
    const titleLower = doc.chunk.title.toLowerCase();
    for (const term of queryTerms) {
      if (titleLower.includes(term)) score += 0.75;
    }

    if (score > 0) {
      scored.push({
        path: doc.chunk.path,
        title: doc.chunk.title,
        snippet: makeSnippet(doc.chunk, queryTerms),
        score,
        page: doc.chunk.page,
        chunkId: doc.chunk.id,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  // dedupe by path keeping best chunk
  const seen = new Set<string>();
  const unique: SearchHit[] = [];
  for (const hit of scored) {
    if (seen.has(hit.path)) continue;
    seen.add(hit.path);
    unique.push(hit);
    if (unique.length >= limit) break;
  }
  return unique;
}

function makeSnippet(chunk: IndexChunk, terms: string[]): string {
  const text = chunk.text.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();
  let idx = -1;
  for (const term of terms) {
    const i = lower.indexOf(term);
    if (i >= 0 && (idx < 0 || i < idx)) idx = i;
  }
  if (idx < 0) return text.slice(0, 220) + (text.length > 220 ? "…" : "");
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + 160);
  return (
    (start > 0 ? "…" : "") +
    text.slice(start, end) +
    (end < text.length ? "…" : "")
  );
}

export function fuzzyFileNames(
  index: WorkspaceIndex | null,
  query: string,
  limit = 12
): { path: string; title: string }[] {
  if (!index) return [];
  const q = query.toLowerCase().trim();
  const files = Object.keys(index.files).map((p) => ({
    path: p,
    title: p.split(/[/\\]/).pop() ?? p,
  }));
  if (!q) return files.slice(0, limit);
  return files
    .filter((f) => f.title.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
    .slice(0, limit);
}
