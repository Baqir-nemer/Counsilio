import { Suspense } from "react";
import { ChatPanel } from "@/components/chat-panel";

export default function AppHomePage() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--muted)]">
            Opening assistant…
          </div>
        }
      >
        <ChatPanel />
      </Suspense>
    </div>
  );
}
