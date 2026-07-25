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

function loadLocalProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

function saveLocalProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function clearLocalProfile(): void {
  localStorage.removeItem(PROFILE_STORAGE_KEY);
}

/** Load profile from Electron store, migrating localStorage once if needed. */
export async function loadProfile(): Promise<UserProfile | null> {
  if (typeof window === "undefined") return null;
  const api = window.counsilio;
  if (api) {
    let profile = await api.getProfile();
    if (!profile) {
      const legacy = loadLocalProfile();
      if (legacy) {
        profile = await api.setProfile(legacy);
        clearLocalProfile();
      }
    }
    return profile;
  }
  return loadLocalProfile();
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const api = window.counsilio;
  if (api) {
    await api.setProfile(profile);
    return;
  }
  saveLocalProfile(profile);
}

export async function clearProfile(): Promise<void> {
  const api = window.counsilio;
  if (api) {
    await api.clearProfile();
    return;
  }
  clearLocalProfile();
}
