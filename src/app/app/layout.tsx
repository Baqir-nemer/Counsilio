import { RequireOnboarded } from "@/components/auth-gates";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireOnboarded>
      <div className="flex min-h-screen flex-col md:h-screen md:flex-row md:overflow-hidden">
        <AppSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--paper)]/40">
          {children}
        </div>
      </div>
    </RequireOnboarded>
  );
}
