export type Country = {
  code: string;
  name: string;
  flag: string;
  defaultLanguage: string;
  lawSummary: string;
};

export const COUNTRIES: Country[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    defaultLanguage: "en",
    lawSummary: "Federal statutes, case law, and state-specific codes",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    defaultLanguage: "en",
    lawSummary: "Common law, Acts of Parliament, and secondary legislation",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    defaultLanguage: "ar",
    lawSummary: "Federal laws, free-zone regulations, and Sharia-influenced civil codes",
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    defaultLanguage: "de",
    lawSummary: "Civil code (BGB), Basic Law, and EU-aligned regulations",
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    defaultLanguage: "fr",
    lawSummary: "Civil code, constitutional law, and administrative sources",
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    defaultLanguage: "en",
    lawSummary: "Federal and provincial statutes, common law and civil law (Québec)",
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    defaultLanguage: "en",
    lawSummary: "Commonwealth and state legislation with common-law precedent",
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    defaultLanguage: "en",
    lawSummary: "Constitution, central acts, and High Court / Supreme Court precedent",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    defaultLanguage: "ar",
    lawSummary: "Basic Law, Sharia principles, and recent commercial reforms",
  },
  {
    code: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    defaultLanguage: "en",
    lawSummary: "Statutes, common law, and specialized commercial regulations",
  },
  {
    code: "NL",
    name: "Netherlands",
    flag: "🇳🇱",
    defaultLanguage: "nl",
    lawSummary: "Civil code, EU law, and administrative jurisprudence",
  },
  {
    code: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    defaultLanguage: "pt",
    lawSummary: "Federal constitution, civil code, and Superior Court decisions",
  },
];

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
