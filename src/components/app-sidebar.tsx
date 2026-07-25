"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/context/profile-context";
import { getCountry } from "@/lib/countries";
import { getLanguage } from "@/lib/languages";

const NAV = [
  { href: "/app", label: "Assistant", exact: true },
  { href: "/app/documents", label: "Documents" },
  { href: "/app/settings", label: "Settings" },
];

/** Thin top rail so the workspace file tree owns the left column on chat. */
export function AppNavRail() {
  const pathname = usePathname();
  const { profile } = useProfile();
  const country = profile ? getCountry(profile.countryCode) : undefined;
  const language = profile ? getLanguage(profile.languageCode) : undefined;

  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-[var(--line)] bg-[var(--panel)]/90 px-4 py-2 backdrop-blur-md">
      <Link
        href="/app"
        className="shrink-0 font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)]"
      >
        Counsilio
      </Link>

      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href || pathname === `${item.href}/`
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? "nav-tab-active" : "nav-tab"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="truncate text-sm font-medium text-[var(--ink)]">
          {profile?.fullName || "Guest"}
        </p>
        <p className="text-xs text-[var(--muted)]">
          {country ? `${country.flag} ${country.name}` : "No country"}
          {language ? ` · ${language.name}` : ""}
        </p>
      </div>
    </header>
  );
}
