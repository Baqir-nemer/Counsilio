"use client";

import Link from "next/link";
import { useProfile } from "@/context/profile-context";
import { getCountry } from "@/lib/countries";

const TEMPLATES = [
  {
    id: "demand-letter",
    title: "Demand letter",
    blurb: "Formal request for payment or performance with cited grounds.",
  },
  {
    id: "nda",
    title: "Mutual NDA",
    blurb: "Confidentiality agreement tailored to your jurisdiction pack.",
  },
  {
    id: "engagement",
    title: "Engagement letter",
    blurb: "Scope, fees, and responsibilities for a professional matter.",
  },
];

export default function DocumentsPage() {
  const { profile } = useProfile();
  const country = profile ? getCountry(profile.countryCode) : undefined;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 md:px-8">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
          Papers
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Document studio
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Start a draft in the assistant. Templates below open a guided prompt
          {country ? ` for ${country.name}` : ""}.
        </p>
      </header>

      <div className="grid max-w-3xl gap-3">
        {TEMPLATES.map((template) => (
          <Link
            key={template.id}
            href={`/app?draft=${template.id}`}
            className="group rounded-xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 transition-all hover:border-[var(--ink)]/35 hover:shadow-md hover:shadow-[var(--ink)]/5"
          >
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)] group-hover:translate-x-0.5 transition-transform">
              {template.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{template.blurb}</p>
          </Link>
        ))}
      </div>

      <p className="mt-8 max-w-2xl text-xs text-[var(--muted)]">
        Export to PDF/DOCX and full generation engine come next. For now, open
        a template and continue in chat.
      </p>
    </div>
  );
}
