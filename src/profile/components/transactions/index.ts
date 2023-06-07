export type TextLanguageVersions = Partial<Record<SupportedLanguage, string>>;

export type Link = {
  url: string;
  display_text?: string;
};

export type LinkLanguageVersions = Partial<Record<SupportedLanguage, Link>>;

export type RawActivity = {
  title?: TextLanguageVersions;
  message?: TextLanguageVersions;
  activity_links?: LinkLanguageVersions;
  activity_timestamp?: string;
};

export type RawStatus = {
  value?: string;
  status_display_values?: TextLanguageVersions;
  timestamp?: string;
};
export type RawStatusHistory = RawActivity[];
export type Official = {
  name: string;
  role: string;
  email: string;
  phone: string;
};
export type Address = {
  street: string;
  city: string;
  postCode: string;
  country: string;
};

export type Content = {
  companyName: string;
  companyNameShort: string;
  companyHome: string;
  companyHomePage: string;
  companyEmail: string;
  foundingYear: string;
  officials: Official[];
  addresses: Address[];
};
export type Attachment = {
  id: number;
  created_at: string;
  updated_at: string;
  filename: string;
  media_type: string;
  size: number;
  href: string;
};

export type RawData = {
  id: string;
  created_at: string;
  updated_at: string;
  status: RawStatus;
  timestamp: string;
  activities: RawActivity[];
  status_histories: RawStatusHistory[];
  type: string;
  human_readable_type: TextLanguageVersions;
  service: string;
  document_language: string;
  attachments: Attachment[];
};

export type Document = {
  id: string;
  createdt: string;
  updated: string;
  status: string;
  activities: Activity[];
  type: string;
  service: string;
  attachments: Attachment[];
};

export type SupportedLanguage = keyof typeof languages;

export type Activity = {
  timestamp: string;
  title: string;
  message?: string;
  status: string;
  actionRequired: boolean;
  uid: string;
  contentType: string;
  link?: Link;
};

export const languages = {
  fi: 'fi',
  en: 'en',
  sv: 'sv',
} as const;
