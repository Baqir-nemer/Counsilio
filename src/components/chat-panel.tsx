"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useProfile } from "@/context/profile-context";
import { getCountry } from "@/lib/countries";
import { getJurisdictionPack } from "@/lib/jurisdiction-packs";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: { title: string; url: string; publisher: string }[];
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
  const country = profile ? getCountry(profile.countryCode) : undefined;
  const pack = profile
    ? getJurisdictionPack(profile.countryCode)
    : undefined;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: country
        ? `Welcome to Counsilio. I am oriented to ${country.name} law sources. Ask a question or request a draft — I will cite jurisdiction-specific references. This is assistance, not legal advice.`
        : "Complete onboarding to load your jurisdiction pack.",
      citations: pack?.sources.slice(0, 2),
    },
  ]);

  useEffect(() => {
    if (!draftId || !DRAFT_PROMPTS[draftId] || draftHandled.current === draftId) {
      return;
    }
    draftHandled.current = draftId;
    const prompt = DRAFT_PROMPTS[draftId];
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
    };
    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: buildMockReply(
        prompt,
        country?.name ?? "your jurisdiction",
        pack?.citationNote
      ),
      citations: pack?.sources,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
  }, [draftId, country?.name, pack]);

  const placeholder = useMemo(
    () =>
      country
        ? `Ask about ${country.name} law, or request a document draft…`
        : "Ask a legal question…",
    [country]
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: buildMockReply(text, country?.name ?? "your jurisdiction", pack?.citationNote),
      citations: pack?.sources,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-[var(--line)] px-5 py-4 md:px-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
          Live assistant
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Counsel session
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          Responses are grounded in your selected country pack
          {country ? ` (${country.name})` : ""}. Always verify citations before
          relying on them.
        </p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6 md:px-8">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`max-w-3xl animate-rise ${
              message.role === "user" ? "ml-auto" : ""
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
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.citations && message.citations.length > 0 && (
                <div className="mt-4 border-t border-[var(--line)] pt-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                    Sources
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
        className="border-t border-[var(--line)] bg-[var(--panel)]/70 px-5 py-4 backdrop-blur md:px-8"
      >
        <div className="mx-auto flex max-w-3xl gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="field flex-1"
            aria-label="Message"
          />
          <button type="submit" className="btn-primary shrink-0">
            Send
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-xs text-[var(--muted)]">
          Counsilio is not a law firm and does not provide legal advice.
        </p>
      </form>
    </div>
  );
}

function buildMockReply(
  question: string,
  countryName: string,
  citationNote?: string
): string {
  return [
    `For ${countryName}, here is a structured starting point for your question:`,
    ``,
    `“${question}”`,
    ``,
    `1. Confirm the exact jurisdiction (federal / state / emirate / province) before drafting.`,
    `2. Identify the controlling statute or code section from the linked official sources below.`,
    `3. I can turn this into a formal letter or agreement draft once you share parties, facts, and desired outcome.`,
    ``,
    citationNote
      ? `Citation guidance: ${citationNote}`
      : `Citation guidance: prefer primary official sources for this country.`,
    ``,
    `Next step: reply with the document type you need (e.g. demand letter, NDA, employment clause).`,
  ].join("\n");
}
