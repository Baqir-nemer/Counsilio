import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

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

export type AppSettings = {
  profile: UserProfile | null;
  workspacePath: string | null;
};

const DEFAULTS: AppSettings = {
  profile: null,
  workspacePath: null,
};

function settingsPath(): string {
  return path.join(app.getPath("userData"), "settings.json");
}

export function loadSettings(): AppSettings {
  try {
    const raw = fs.readFileSync(settingsPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      profile: parsed.profile ?? null,
      workspacePath: parsed.workspacePath ?? null,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings: AppSettings): void {
  const dir = path.dirname(settingsPath());
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2), "utf8");
}

export function getProfile(): UserProfile | null {
  return loadSettings().profile;
}

export function setProfile(profile: UserProfile | null): UserProfile | null {
  const settings = loadSettings();
  settings.profile = profile;
  saveSettings(settings);
  return profile;
}

export function getWorkspacePath(): string | null {
  return loadSettings().workspacePath;
}

export function setWorkspacePath(workspacePath: string | null): string | null {
  const settings = loadSettings();
  settings.workspacePath = workspacePath;
  saveSettings(settings);
  return workspacePath;
}

export function clearAll(): void {
  saveSettings({ ...DEFAULTS });
}
