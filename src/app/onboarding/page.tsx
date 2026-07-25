import { RedirectIfOnboarded } from "@/components/auth-gates";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen flex-col px-5 py-10 md:px-8 md:py-14">
      <div className="mb-10 flex items-center justify-between">
        <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          Counsilio
        </span>
        <span className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          First-time setup
        </span>
      </div>
      <RedirectIfOnboarded>
        <OnboardingWizard />
      </RedirectIfOnboarded>
    </main>
  );
}
