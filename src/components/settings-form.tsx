"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/profile-context";
import { COUNTRIES } from "@/lib/countries";
import { LANGUAGES } from "@/lib/languages";
import { getJurisdictionPack } from "@/lib/jurisdiction-packs";
import type { UserProfile } from "@/lib/profile";

export function SettingsForm() {
  const router = useRouter();
  const { profile, updateProfile, resetProfile } = useProfile();
  const [draft, setDraft] = useState<UserProfile | null>(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  if (!draft) return null;

  const pack = getJurisdictionPack(draft.countryCode);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    updateProfile({ ...draft });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function onReset() {
    resetProfile();
    router.push("/onboarding");
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
          Preferences
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Your profile
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Country choice controls which official law sources Counsilio cites.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block">
          <span className="label">Full name</span>
          <input
            className="field mt-1.5"
            value={draft.fullName}
            onChange={(e) =>
              setDraft({ ...draft, fullName: e.target.value })
            }
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Email</span>
            <input
              className="field mt-1.5"
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="label">Phone</span>
            <input
              className="field mt-1.5"
              type="tel"
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            />
          </label>
        </div>

        <label className="block">
          <span className="label">Role</span>
          <input
            className="field mt-1.5"
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value })}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Country / jurisdiction</span>
            <select
              className="field mt-1.5"
              value={draft.countryCode}
              onChange={(e) =>
                setDraft({ ...draft, countryCode: e.target.value })
              }
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">Language</span>
            <select
              className="field mt-1.5"
              value={draft.languageCode}
              onChange={(e) =>
                setDraft({ ...draft, languageCode: e.target.value })
              }
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </label>
        </div>

        {pack && (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Active law pack
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {pack.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-deep)] hover:underline"
                  >
                    {s.title}
                  </a>
                  <span className="text-[var(--muted)]"> — {s.publisher}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--muted)]">{pack.citationNote}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" className="btn-primary">
            Save changes
          </button>
          <button type="button" onClick={onReset} className="btn-ghost">
            Reset & re-onboard
          </button>
          {saved && (
            <span className="text-sm text-[var(--accent-deep)]">Saved.</span>
          )}
        </div>
      </form>
    </div>
  );
}
