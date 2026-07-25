"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { useProfile } from "@/context/profile-context";
import { useWorkspace } from "@/context/workspace-context";
import { getCountry } from "@/lib/countries";
import { getJurisdictionPack } from "@/lib/jurisdiction-packs";
import { buildGroundedReply } from "@/lib/answer-engine";
import {
  COUNSILIO_DRAG_TYPE,
  WorkspaceExplorer,
} from "@/components/workspace-explorer";

type JurisdictionCitation = {
  title: string;
  url: string;
  publisher: string;
};

type LocalCitation = {
  title: string;
  path: string;
  snippet: string;
  page?: number;
};

type ContextFile = {
  path: string;
  title: string;
  isDirectory?: boolean;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: JurisdictionCitation[];
  localCitations?: LocalCitation[];
  attachments?: ContextFile[];
};

const DRAFT_PROMPTS: Record<string, string> = {
  "demand-letter":
    "Help me draft a demand letter. Ask me for the parties, amount or obligation, deadline, and key facts.",
  nda: "Help me draft a mutual NDA. Ask me for the parties, purpose of disclosure, and duration.",
  engagement:
    "Help me draft an engagement letter. Ask me for the parties, scope of work, fees, and governing jurisdiction.",
};

export function ChatPanel() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft");
  const draftHandled = useRef<string | null>(null);
  const { profile } = useProfile();
  const {
    search,
    fuzzyFiles,
    pathForDrop,
    reveal,
    workspacePath,
  } = useWorkspace();

  const country = profile ? getCountry(profile.countryCode) : undefined;
  const pack = profile
    ? getJurisdictionPack(profile.countryCode)
    : undefined;

  const [collapsed, setCollapsed] = useState(false);
  const [input, setInput] = useState("");
  const [contextFiles, setContextFiles] = useState<ContextFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState<
    { path: string; title: string }[]
  >([]);
  const [busy, setBusy] = useState(false);

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: country
        ? `Welcome to Counsilio. I am oriented to ${country.name} law sources and your local workspace${
            workspacePath ? ` at ${workspacePath}` : ""
          }. Ask a question, attach files from the left, or drag documents into chat. This is assistance, not legal advice.`
        : "Complete onboarding to load your jurisdiction pack.",
      citations: pack?.sources.slice(0, 2),
    },
  ]);

  const attachFile = useCallback(
    (path: string, title: string, isDirectory = false) => {
      setContextFiles((prev) => {
        if (prev.some((f) => f.path === path)) return prev;
        return [...prev, { path, title, isDirectory }];
      });
    },
    []
  );

  const removeContext = useCallback((path: string) => {
    setContextFiles((prev) => prev.filter((f) => f.path !== path));
  }, []);

  async function replyTo(text: string) {
    setBusy(true);
    try {
      const hits = await search(text, 8);
      const { content, localCitations } = buildGroundedReply({
        question: text,
        countryName: country?.name ?? "your jurisdiction",
        citationNote: pack?.citationNote,
        hits,
        attachedTitles: contextFiles.map((f) => f.title),
      });

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        attachments: contextFiles.length > 0 ? [...contextFiles] : undefined,
      };
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        citations: pack?.sources,
        localCitations,
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setContextFiles([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!draftId || !DRAFT_PROMPTS[draftId] || draftHandled.current === draftId) {
      return;
    }
    draftHandled.current = draftId;
    void replyTo(DRAFT_PROMPTS[draftId]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  useEffect(() => {
    if (!mentionOpen) return;
    let cancelled = false;
    void fuzzyFiles(mentionQuery).then((results) => {
      if (!cancelled) setMentionResults(results);
    });
    return () => {
      cancelled = true;
    };
  }, [mentionOpen, mentionQuery, fuzzyFiles]);

  const placeholder = useMemo(
    () =>
      country
        ? `Ask about ${country.name} law, @file, or request a draft…`
        : "Ask a legal question…",
    [country]
  );

  function onInputChange(value: string) {
    setInput(value);
    const at = value.lastIndexOf("@");
    if (at >= 0) {
      const after = value.slice(at + 1);
      if (!after.includes(" ") && after.length < 40) {
        setMentionOpen(true);
        setMentionQuery(after);
        return;
      }
    }
    setMentionOpen(false);
    setMentionQuery("");
  }

  function pickMention(file: { path: string; title: string }) {
    attachFile(file.path, file.title);
    const at = input.lastIndexOf("@");
    if (at >= 0) {
      setInput(input.slice(0, at).trimEnd() + (at > 0 ? " " : ""));
    }
    setMentionOpen(false);
    setMentionQuery("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMentionOpen(false);
    await replyTo(text);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);

    const internal = e.dataTransfer.getData(COUNSILIO_DRAG_TYPE);
    if (internal) {
      try {
        const entry = JSON.parse(internal) as {
          path: string;
          name: string;
          isDirectory: boolean;
        };
        attachFile(entry.path, entry.name, entry.isDirectory);
        return;
      } catch {
        // fall through to Finder handling
      }
    }

    for (const file of Array.from(e.dataTransfer.files)) {
      const p = pathForDrop(file);
      if (p) attachFile(p, file.name, false);
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full">
      <WorkspaceExplorer
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onAttachFile={attachFile}
      />

      <div
        className={`relative flex min-h-0 min-w-0 flex-1 flex-col ${
          dragging ? "ring-2 ring-inset ring-[var(--accent)]" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <header className="border-b border-[var(--line)] px-5 py-4 md:px-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
            Live assistant
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            Counsel session
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Grounded in your workspace
            {country ? ` and ${country.name} law pack` : ""}. Drag files here or
            click them in the explorer. Always verify citations.
          </p>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6 md:px-8">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`w-full animate-rise ${
                message.role === "user" ? "ml-auto max-w-4xl" : "max-w-4xl"
              }`}
            >
              <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                {message.role === "user" ? "You" : "Counsilio"}
              </p>
              <div
                className={`rounded-lg px-4 py-3 text-[15px] leading-relaxed ${
                  message.role === "user"
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "bg-[var(--panel)] text-[var(--ink)] ring-1 ring-[var(--line)]"
                }`}
              >
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {message.attachments.map((ref) => (
                      <button
                        key={ref.path}
                        type="button"
                        onClick={() => void reveal(ref.path)}
                        title={`${ref.path} — reveal in Finder`}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ${
                          message.role === "user"
                            ? "bg-[var(--paper)]/15 text-[var(--paper)] hover:bg-[var(--paper)]/25"
                            : "bg-[var(--mist)] text-[var(--ink)]"
                        }`}
                      >
                        <span className="opacity-70">
                          {ref.isDirectory ? "▤" : "◈"}
                        </span>
                        {ref.title}
                      </button>
                    ))}
                  </div>
                )}

                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.localCitations && message.localCitations.length > 0 && (
                  <div className="mt-4 border-t border-[var(--line)] pt-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                      Workspace sources
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {message.localCitations.map((cite) => (
                        <li key={cite.path + cite.snippet.slice(0, 24)} className="text-sm">
                          <button
                            type="button"
                            className="text-left text-[var(--accent-deep)] underline-offset-2 hover:underline"
                            onClick={() => void reveal(cite.path)}
                            title={cite.path}
                          >
                            {cite.title}
                            {cite.page ? `, p. ${cite.page}` : ""}
                          </button>
                          <span className="block text-xs text-[var(--muted)]">
                            {cite.path}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {message.citations && message.citations.length > 0 && (
                  <div className="mt-4 border-t border-[var(--line)] pt-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                      Official sources
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {message.citations.map((cite) => (
                        <li key={cite.url} className="text-sm">
                          <a
                            href={cite.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent-deep)] underline-offset-2 hover:underline"
                          >
                            {cite.title}
                          </a>
                          <span className="text-[var(--muted)]">
                            {" "}
                            — {cite.publisher}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <form
          onSubmit={onSubmit}
          className="relative border-t border-[var(--line)] bg-[var(--panel)]/70 px-5 py-4 backdrop-blur md:px-8"
        >
          {mentionOpen && mentionResults.length > 0 && (
            <div className="absolute bottom-full left-5 right-5 mb-2 max-h-48 overflow-y-auto rounded-lg border border-[var(--line)] bg-[var(--panel)] shadow-lg md:left-8 md:right-8">
              {mentionResults.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-[var(--mist)]"
                  onClick={() => pickMention(file)}
                >
                  <span className="font-medium">{file.title}</span>
                  <span className="ml-2 text-xs text-[var(--muted)]">
                    {file.path}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div
            className={`rounded-xl border bg-[var(--panel)] transition-colors ${
              dragging
                ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/25"
                : "border-[var(--line)]"
            }`}
          >
            {contextFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-3 pt-3">
                {contextFiles.map((file) => (
                  <span
                    key={file.path}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--mist)] py-0.5 pl-2 pr-1 text-xs text-[var(--ink)]"
                    title={file.path}
                  >
                    <span className="opacity-60">
                      {file.isDirectory ? "▤" : "◈"}
                    </span>
                    {file.title}
                    <button
                      type="button"
                      onClick={() => removeContext(file.path)}
                      className="rounded px-1 text-[var(--muted)] hover:bg-[var(--line)] hover:text-[var(--ink)]"
                      aria-label={`Remove ${file.title}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 p-2">
              <input
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={
                  dragging ? "Drop to add as reference…" : placeholder
                }
                className="flex-1 bg-transparent px-2 py-2 text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
                aria-label="Message"
                disabled={busy}
              />
              <button
                type="submit"
                className="btn-primary shrink-0"
                disabled={busy}
              >
                {busy ? "…" : "Send"}
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Drag files or folders from the explorer to reference them. Counsilio
            is not a law firm and does not provide legal advice.
          </p>
        </form>
      </div>
    </div>
  );
}
