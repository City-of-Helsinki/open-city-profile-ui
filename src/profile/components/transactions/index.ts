import { AnyObject } from 'yup/lib/types';

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
export type RawStatusHistory = RawStatus & {
  timestamp: string;
  activities: RawActivity[];
};
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

export type Company = {
  companyName: string;
  companyNameShort: string;
  companyHome: string;
  companyHomePage: string;
  companyEmail: string;
  foundingYear: string;
  officials: Official[];
  addresses: Address[];
};
export type Content = AnyObject;

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
  content: AnyObject;
};

export type RawResults = {
  results: RawData[];
};

export type History = {
  created: string;
  status: string;
  statusType: StatusType;
  activities: Activity[];
  key: string;
};

export type Document = {
  id: string;
  title: string;
  created: string;
  updated: string;
  status: string;
  statusType: StatusType;
  history: History[];
  type: string;
  service: string;
  attachments: Attachment[];
  contentType: string;
  actionRequired: boolean;
  content?: Content;
};

export type SupportedLanguage = keyof typeof languages;
export type StatusType = keyof typeof statusTypes;

export type Activity = {
  created: string;
  title: string;
  message?: string;
  actionRequired: boolean;
  uid: string;
  link?: Link;
};

export const languages = {
  fi: 'fi',
  en: 'en',
  sv: 'sv',
} as const;

export const statusTypes = {
  received: 'received',
  submitted: 'submitted',
  'in-progress': 'in-progress',
  ready: 'ready',
  waiting: 'waiting',
  proposal: 'proposal',
  unknown: 'unknown',
  'action-required': 'action-required',
} as const;
