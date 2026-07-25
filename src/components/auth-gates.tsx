"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/profile-context";
import { useWorkspace } from "@/context/workspace-context";

export function RequireOnboarded({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready: profileReady, isOnboarded } = useProfile();
  const { ready: workspaceReady, hasWorkspace, isDesktop } = useWorkspace();

  const ready = profileReady && workspaceReady;
  const complete = isOnboarded && (!isDesktop || hasWorkspace);

  useEffect(() => {
    if (ready && !complete) {
      router.replace("/onboarding");
    }
  }, [ready, complete, router]);

  if (!ready || !complete) {
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
  const { ready: profileReady, isOnboarded } = useProfile();
  const { ready: workspaceReady, hasWorkspace, isDesktop } = useWorkspace();

  const ready = profileReady && workspaceReady;
  const complete = isOnboarded && (!isDesktop || hasWorkspace);

  useEffect(() => {
    if (ready && complete) {
      router.replace("/app");
    }
  }, [ready, complete, router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  if (complete) return null;

  return <>{children}</>;
}
