"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/profile-context";

export default function HomePage() {
  const router = useRouter();
  const { ready, isOnboarded } = useProfile();

  useEffect(() => {
    if (ready && isOnboarded) {
      router.replace("/app");
    }
  }, [ready, isOnboarded, router]);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,40,32,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,40,32,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          Counsilio
        </span>
        <Link href="/onboarding" className="btn-ghost text-sm">
          Get started
        </Link>
      </nav>

      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-20 pt-8 md:px-10">
        <div className="animate-rise max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
            International legal drafting
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight text-[var(--ink)] md:text-7xl">
            Counsilio
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)] md:text-xl">
            Choose your country. Load its law sources. Draft papers with
            citations you can verify.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/onboarding" className="btn-primary">
              Start with your jurisdiction
            </Link>
            <a href="#how" className="btn-ghost">
              How it works
            </a>
          </div>
        </div>

        <div
          id="how"
          className="animate-drift mt-16 grid max-w-3xl gap-6 border-t border-[var(--line)] pt-8 md:grid-cols-3"
        >
          {[
            {
              title: "Country first",
              body: "Your jurisdiction unlocks the matching official source pack.",
            },
            {
              title: "Cited answers",
              body: "Every assistant reply surfaces primary sites for that country.",
            },
            {
              title: "Your profile",
              body: "Language, contact details, and preferences stay with you.",
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className="animate-rise"
              style={{ animationDelay: `${120 + i * 90}ms` }}
            >
              <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
