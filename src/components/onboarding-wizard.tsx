"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/countries";
import { LANGUAGES } from "@/lib/languages";
import { emptyProfile, type UserProfile } from "@/lib/profile";
import { useProfile } from "@/context/profile-context";

const STEPS = ["Country", "Language", "Profile", "Confirm"] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const { updateProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(emptyProfile());
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === draft.countryCode),
    [draft.countryCode]
  );

  function next() {
    setError("");
    if (step === 0 && !draft.countryCode) {
      setError("Choose your country to load the matching law pack.");
      return;
    }
    if (step === 1 && !draft.languageCode) {
      setError("Choose a preferred language.");
      return;
    }
    if (step === 2) {
      if (!draft.fullName.trim() || !draft.email.trim()) {
        setError("Name and email are required to create your profile.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
        setError("Enter a valid email address.");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  function finish() {
    if (!accepted) {
      setError("Please accept the disclaimer to continue.");
      return;
    }
    const profile: UserProfile = {
      ...draft,
      acceptedDisclaimer: true,
      onboardedAt: new Date().toISOString(),
    };
    updateProfile(profile);
    router.push("/app");
  }

  return (
    <div className="mx-auto w-full max-w-2xl animate-rise">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
          Setup · {step + 1} / {STEPS.length}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] md:text-5xl">
          {STEPS[step]}
        </h1>
        <div className="mt-5 flex gap-2">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                i <= step ? "bg-[var(--accent)]" : "bg-[var(--line)]"
              }`}
            />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {COUNTRIES.map((country) => {
            const active = draft.countryCode === country.code;
            return (
              <button
                key={country.code}
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    countryCode: country.code,
                    languageCode: country.defaultLanguage,
                  }))
                }
                className={`rounded-lg border px-4 py-3 text-left transition-all ${
                  active
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] shadow-lg shadow-[var(--ink)]/10"
                    : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--ink)]/40"
                }`}
              >
                <span className="text-lg">
                  {country.flag} {country.name}
                </span>
                <p
                  className={`mt-1 text-xs leading-snug ${
                    active ? "text-[var(--paper)]/70" : "text-[var(--muted)]"
                  }`}
                >
                  {country.lawSummary}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGUAGES.map((language) => {
            const active = draft.languageCode === language.code;
            return (
              <button
                key={language.code}
                type="button"
                onClick={() =>
                  setDraft((d) => ({ ...d, languageCode: language.code }))
                }
                className={`rounded-lg border px-4 py-3 text-left transition-all ${
                  active
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                    : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--ink)]/40"
                }`}
              >
                <span className="font-medium">{language.name}</span>
                <span
                  className={`mt-0.5 block text-sm ${
                    active ? "text-[var(--paper)]/70" : "text-[var(--muted)]"
                  }`}
                >
                  {language.nativeName}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <label className="block">
            <span className="label">Full name</span>
            <input
              className="field mt-1.5"
              value={draft.fullName}
              onChange={(e) =>
                setDraft((d) => ({ ...d, fullName: e.target.value }))
              }
              placeholder="Amina Rahman"
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="label">Email</span>
            <input
              className="field mt-1.5"
              type="email"
              value={draft.email}
              onChange={(e) =>
                setDraft((d) => ({ ...d, email: e.target.value }))
              }
              placeholder="you@firm.com"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="label">Phone (optional)</span>
            <input
              className="field mt-1.5"
              type="tel"
              value={draft.phone}
              onChange={(e) =>
                setDraft((d) => ({ ...d, phone: e.target.value }))
              }
              placeholder="+1 555 0100"
              autoComplete="tel"
            />
          </label>
          <label className="block">
            <span className="label">Role (optional)</span>
            <input
              className="field mt-1.5"
              value={draft.role}
              onChange={(e) =>
                setDraft((d) => ({ ...d, role: e.target.value }))
              }
              placeholder="Founder, counsel, individual…"
            />
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--muted)]">Country</dt>
              <dd className="mt-0.5 font-medium text-[var(--ink)]">
                {selectedCountry
                  ? `${selectedCountry.flag} ${selectedCountry.name}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Language</dt>
              <dd className="mt-0.5 font-medium text-[var(--ink)]">
                {LANGUAGES.find((l) => l.code === draft.languageCode)?.name ??
                  "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Name</dt>
              <dd className="mt-0.5 font-medium text-[var(--ink)]">
                {draft.fullName}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Email</dt>
              <dd className="mt-0.5 font-medium text-[var(--ink)]">
                {draft.email}
              </dd>
            </div>
          </dl>

          <label className="flex items-start gap-3 rounded-lg bg-[var(--mist)] p-4 text-sm leading-relaxed text-[var(--ink)]">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1"
            />
            <span>
              I understand Counsilio provides drafting and research assistance
              only. It is not a substitute for a licensed lawyer, and outputs
              may contain errors. I will verify citations and seek professional
              counsel for legal decisions.
            </span>
          </label>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="btn-ghost disabled:opacity-40"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next} className="btn-primary">
            Continue
          </button>
        ) : (
          <button type="button" onClick={finish} className="btn-primary">
            Enter Counsilio
          </button>
        )}
      </div>
    </div>
  );
}
