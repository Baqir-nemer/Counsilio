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

export function AppSidebar() {
  const pathname = usePathname();
  const { profile } = useProfile();
  const country = profile ? getCountry(profile.countryCode) : undefined;
  const language = profile ? getLanguage(profile.languageCode) : undefined;

  return (
    <aside className="flex w-full flex-col border-b border-[var(--line)] bg-[var(--panel)]/80 backdrop-blur-md md:h-full md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-3 px-5 py-5 md:flex-col md:items-start md:gap-1">
        <Link href="/app" className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)]">
          Counsilio
        </Link>
        <p className="hidden text-xs text-[var(--muted)] md:block">
          Jurisdiction-aware legal drafting
        </p>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:px-3 md:pb-0">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "text-[var(--muted)] hover:bg-[var(--mist)] hover:text-[var(--ink)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-[var(--line)] p-4 md:block">
        <p className="truncate text-sm font-medium text-[var(--ink)]">
          {profile?.fullName || "Guest"}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {country ? `${country.flag} ${country.name}` : "No country"}
          {language ? ` · ${language.name}` : ""}
        </p>
      </div>
    </aside>
  );
}
