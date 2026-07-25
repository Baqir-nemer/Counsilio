export type LawSource = {
  title: string;
  url: string;
  publisher: string;
};

export type JurisdictionPack = {
  countryCode: string;
  sources: LawSource[];
  citationNote: string;
};

export const JURISDICTION_PACKS: Record<string, JurisdictionPack> = {
  US: {
    countryCode: "US",
    citationNote: "Prefer primary federal and state sources; note jurisdiction clearly.",
    sources: [
      {
        title: "Congress.gov — Legislation",
        url: "https://www.congress.gov/",
        publisher: "U.S. Congress",
      },
      {
        title: "Legal Information Institute (Cornell)",
        url: "https://www.law.cornell.edu/",
        publisher: "Cornell Law School",
      },
      {
        title: "Federal Register",
        url: "https://www.federalregister.gov/",
        publisher: "National Archives",
      },
    ],
  },
  GB: {
    countryCode: "GB",
    citationNote: "Cite legislation.gov.uk and BAILII for case law where possible.",
    sources: [
      {
        title: "legislation.gov.uk",
        url: "https://www.legislation.gov.uk/",
        publisher: "The National Archives",
      },
      {
        title: "BAILII",
        url: "https://www.bailii.org/",
        publisher: "BAILII",
      },
      {
        title: "GOV.UK Courts and Tribunals",
        url: "https://www.gov.uk/government/organisations/hm-courts-and-tribunals-service",
        publisher: "UK Government",
      },
    ],
  },
  AE: {
    countryCode: "AE",
    citationNote: "Distinguish federal UAE law from free-zone and emirate-level rules.",
    sources: [
      {
        title: "UAE Legislation Portal",
        url: "https://uaelegislation.gov.ae/en",
        publisher: "UAE Government",
      },
      {
        title: "Ministry of Justice — UAE",
        url: "https://www.moj.gov.ae/en",
        publisher: "Ministry of Justice",
      },
      {
        title: "UAE Official Gazette references",
        url: "https://u.ae/en/information-and-services",
        publisher: "U.AE",
      },
    ],
  },
  DE: {
    countryCode: "DE",
    citationNote: "Use Gesetze-im-Internet and official court portals for primary cites.",
    sources: [
      {
        title: "Gesetze im Internet",
        url: "https://www.gesetze-im-internet.de/",
        publisher: "BMJV",
      },
      {
        title: "Bundesverfassungsgericht",
        url: "https://www.bundesverfassungsgericht.de/",
        publisher: "BVerfG",
      },
      {
        title: "EUR-Lex (EU law)",
        url: "https://eur-lex.europa.eu/",
        publisher: "European Union",
      },
    ],
  },
  FR: {
    countryCode: "FR",
    citationNote: "Prefer Légifrance for codes, laws, and official publications.",
    sources: [
      {
        title: "Légifrance",
        url: "https://www.legifrance.gouv.fr/",
        publisher: "République Française",
      },
      {
        title: "Conseil Constitutionnel",
        url: "https://www.conseil-constitutionnel.fr/",
        publisher: "Conseil Constitutionnel",
      },
      {
        title: "EUR-Lex (EU law)",
        url: "https://eur-lex.europa.eu/",
        publisher: "European Union",
      },
    ],
  },
  CA: {
    countryCode: "CA",
    citationNote: "Separate federal and provincial authority; note Québec civil law when relevant.",
    sources: [
      {
        title: "Justice Laws Website",
        url: "https://laws-lois.justice.gc.ca/",
        publisher: "Government of Canada",
      },
      {
        title: "CanLII",
        url: "https://www.canlii.org/",
        publisher: "CanLII",
      },
      {
        title: "Supreme Court of Canada",
        url: "https://www.scc-csc.ca/",
        publisher: "SCC",
      },
    ],
  },
  AU: {
    countryCode: "AU",
    citationNote: "Cite Commonwealth or state legislation explicitly.",
    sources: [
      {
        title: "Federal Register of Legislation",
        url: "https://www.legislation.gov.au/",
        publisher: "Australian Government",
      },
      {
        title: "AustLII",
        url: "https://www.austlii.edu.au/",
        publisher: "AustLII",
      },
      {
        title: "High Court of Australia",
        url: "https://www.hcourt.gov.au/",
        publisher: "HCA",
      },
    ],
  },
  IN: {
    countryCode: "IN",
    citationNote: "Prefer India Code and official court websites for primary authority.",
    sources: [
      {
        title: "India Code",
        url: "https://www.indiacode.nic.in/",
        publisher: "Government of India",
      },
      {
        title: "Supreme Court of India",
        url: "https://www.sci.gov.in/",
        publisher: "SCI",
      },
      {
        title: "Legislative Department",
        url: "https://legislative.gov.in/",
        publisher: "Ministry of Law & Justice",
      },
    ],
  },
  SA: {
    countryCode: "SA",
    citationNote: "Note Basic Law, Sharia principles, and commercial reform statutes separately.",
    sources: [
      {
        title: "Saudi Laws / National Portal",
        url: "https://www.my.gov.sa/",
        publisher: "Kingdom of Saudi Arabia",
      },
      {
        title: "Board of Grievances references",
        url: "https://www.bog.gov.sa/",
        publisher: "Board of Grievances",
      },
      {
        title: "Ministry of Justice — KSA",
        url: "https://www.moj.gov.sa/",
        publisher: "Ministry of Justice",
      },
    ],
  },
  SG: {
    countryCode: "SG",
    citationNote: "Cite Singapore Statutes Online and Singapore Law Reports where available.",
    sources: [
      {
        title: "Singapore Statutes Online",
        url: "https://sso.agc.gov.sg/",
        publisher: "AGC Singapore",
      },
      {
        title: "Singapore Courts",
        url: "https://www.judiciary.gov.sg/",
        publisher: "Judiciary",
      },
      {
        title: "LawNet / common law references",
        url: "https://www.singaporelawwatch.sg/",
        publisher: "Singapore Law Watch",
      },
    ],
  },
  NL: {
    countryCode: "NL",
    citationNote: "Use overheid.nl / wetten.overheid.nl for primary Dutch legislation.",
    sources: [
      {
        title: "wetten.overheid.nl",
        url: "https://wetten.overheid.nl/",
        publisher: "Overheid.nl",
      },
      {
        title: "de Rechtspraak",
        url: "https://www.rechtspraak.nl/",
        publisher: "Dutch Judiciary",
      },
      {
        title: "EUR-Lex (EU law)",
        url: "https://eur-lex.europa.eu/",
        publisher: "European Union",
      },
    ],
  },
  BR: {
    countryCode: "BR",
    citationNote: "Prefer Planalto and official court portals for Brazilian primary law.",
    sources: [
      {
        title: "Planalto — Legislation",
        url: "https://www.planalto.gov.br/ccivil_03/",
        publisher: "Presidência da República",
      },
      {
        title: "Supreme Federal Court (STF)",
        url: "https://portal.stf.jus.br/",
        publisher: "STF",
      },
      {
        title: "Superior Court of Justice (STJ)",
        url: "https://www.stj.jus.br/",
        publisher: "STJ",
      },
    ],
  },
};

export function getJurisdictionPack(countryCode: string): JurisdictionPack | undefined {
  return JURISDICTION_PACKS[countryCode];
}
