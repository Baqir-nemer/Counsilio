export type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  languageCode: string;
  role: string;
  acceptedDisclaimer: boolean;
  onboardedAt: string;
};

export const PROFILE_STORAGE_KEY = "counsilio.profile.v1";

export const emptyProfile = (): Omit<
  UserProfile,
  "onboardedAt" | "acceptedDisclaimer"
> => ({
  fullName: "",
  email: "",
  phone: "",
  countryCode: "",
  languageCode: "en",
  role: "",
});

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_STORAGE_KEY);
}

export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.fullName.trim() &&
      profile.email.trim() &&
      profile.countryCode &&
      profile.languageCode &&
      profile.acceptedDisclaimer &&
      profile.onboardedAt
  );
}
