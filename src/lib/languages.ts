export type Language = {
  code: string;
  name: string;
  nativeName: string;
};

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
];

export function getLanguage(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}
