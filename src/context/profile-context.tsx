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
  updateProfile: (next: UserProfile) => void;
  resetProfile: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setReady(true);
  }, []);

  const updateProfile = useCallback((next: UserProfile) => {
    saveProfile(next);
    setProfile(next);
  }, []);

  const resetProfile = useCallback(() => {
    clearProfile();
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
