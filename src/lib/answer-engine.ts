import type { SearchHit } from "@/lib/workspace-bridge";

export type LocalCitation = {
  title: string;
  path: string;
  snippet: string;
  page?: number;
};

export type JurisdictionCitation = {
  title: string;
  url: string;
  publisher: string;
};

export function buildGroundedReply(opts: {
  question: string;
  countryName: string;
  citationNote?: string;
  hits: SearchHit[];
  attachedTitles: string[];
}): { content: string; localCitations: LocalCitation[] } {
  const { question, countryName, citationNote, hits, attachedTitles } = opts;

  const localCitations: LocalCitation[] = hits.map((h) => ({
    title: h.title,
    path: h.path,
    snippet: h.snippet,
    page: h.page,
  }));

  const lines: string[] = [
    `For ${countryName}, here is a grounded starting point for:`,
    ``,
    `“${question}”`,
    ``,
  ];

  if (attachedTitles.length > 0) {
    lines.push(
      `Attached context: ${attachedTitles.join(", ")}.`,
      ``
    );
  }

  if (hits.length > 0) {
    lines.push(`From your local workspace:`);
    hits.slice(0, 5).forEach((hit, i) => {
      const page = hit.page ? `, p. ${hit.page}` : "";
      lines.push(
        `${i + 1}. ${hit.title}${page} — ${hit.snippet}`
      );
    });
    lines.push(``);
    lines.push(
      `1. Cross-check the excerpts above against the original files in your workspace.`,
      `2. Confirm the exact jurisdiction (federal / state / emirate / province) before drafting.`,
      `3. I can turn this into a formal letter or agreement once you share parties, facts, and desired outcome.`
    );
  } else {
    lines.push(
      `I did not find a strong match in your indexed workspace for this question yet.`,
      ``,
      `1. Confirm the exact jurisdiction before drafting.`,
      `2. Identify the controlling statute from the linked official sources below.`,
      `3. Attach a file from the left explorer (or drag one into chat) so I can ground the next reply in your documents.`
    );
  }

  lines.push(``);
  lines.push(
    citationNote
      ? `Citation guidance: ${citationNote}`
      : `Citation guidance: prefer primary official sources for this country.`
  );
  lines.push(``);
  lines.push(
    `Next step: reply with the document type you need (e.g. demand letter, NDA, employment clause), or select more files from the workspace tree.`
  );

  return { content: lines.join("\n"), localCitations };
}
