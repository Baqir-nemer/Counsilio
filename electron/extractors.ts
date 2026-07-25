import fs from "node:fs/promises";
import path from "node:path";

const TEXT_EXTS = new Set([
  ".md",
  ".txt",
  ".csv",
  ".json",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".html",
  ".css",
  ".xml",
  ".yml",
  ".yaml",
  ".rtf",
]);

export async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const { PDFParse } = await import("pdf-parse");
    const buf = await fs.readFile(filePath);
    const parser = new PDFParse({ data: new Uint8Array(buf) });
    const result = await parser.getText();
    await parser.destroy();
    return result.text ?? "";
  }

  if (ext === ".docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value ?? "";
  }

  if (TEXT_EXTS.has(ext) || ext === "") {
    try {
      const buf = await fs.readFile(filePath);
      // skip obvious binaries
      if (buf.includes(0)) return "";
      return buf.toString("utf8");
    } catch {
      return "";
    }
  }

  return "";
}

export function isIndexable(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return (
    ext === ".pdf" ||
    ext === ".docx" ||
    TEXT_EXTS.has(ext) ||
    ext === ""
  );
}
