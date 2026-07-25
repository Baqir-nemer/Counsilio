import { RequireOnboarded } from "@/components/auth-gates";
import { AppNavRail } from "@/components/app-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireOnboarded>
      <div className="flex h-screen flex-col overflow-hidden">
        <AppNavRail />
        <div className="flex min-h-0 min-w-0 flex-1 bg-[var(--paper)]/40">
          {children}
        </div>
      </div>
    </RequireOnboarded>
  );
}
