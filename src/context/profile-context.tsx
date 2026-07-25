"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearProfile,
  isProfileComplete,
  loadProfile,
  saveProfile,
  type UserProfile,
} from "@/lib/profile";

type ProfileContextValue = {
  profile: UserProfile | null;
  ready: boolean;
  isOnboarded: boolean;
  updateProfile: (next: UserProfile) => Promise<void>;
  resetProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const loaded = await loadProfile();
      if (!cancelled) {
        setProfile(loaded);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateProfile = useCallback(async (next: UserProfile) => {
    await saveProfile(next);
    setProfile(next);
  }, []);

  const resetProfile = useCallback(async () => {
    await clearProfile();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      ready,
      isOnboarded: isProfileComplete(profile),
      updateProfile,
      resetProfile,
    }),
    [profile, ready, updateProfile, resetProfile]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return ctx;
}
