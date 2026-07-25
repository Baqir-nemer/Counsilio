"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/profile-context";

export function RequireOnboarded({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, isOnboarded } = useProfile();

  useEffect(() => {
    if (ready && !isOnboarded) {
      router.replace("/onboarding");
    }
  }, [ready, isOnboarded, router]);

  if (!ready || !isOnboarded) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[var(--muted)]">
        Loading your workspace…
      </div>
    );
  }

  return <>{children}</>;
}

export function RedirectIfOnboarded({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { ready, isOnboarded } = useProfile();

  useEffect(() => {
    if (ready && isOnboarded) {
      router.replace("/app");
    }
  }, [ready, isOnboarded, router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  if (isOnboarded) return null;

  return <>{children}</>;
}
