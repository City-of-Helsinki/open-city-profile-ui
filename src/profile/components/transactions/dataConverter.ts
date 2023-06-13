import _ from 'lodash';
import { AnyObject } from 'yup/lib/types';

import {
  Activity,
  RawActivity,
  RawData,
  SupportedLanguage,
  Document,
  RawResults,
  TextLanguageVersions,
  RawStatus,
  RawStatusHistory,
  History,
  StatusType,
} from '.';

const translations: Record<string, TextLanguageVersions> = {
  submitted: {
    fi: 'Lähetetty',
    sv: 'Lähetetty (sv)',
    en: 'Submitted',
  },
};

let counter = 0;

const createKey = (pref: string) => {
  counter = counter + 1;
  return `${pref}${counter}`;
};

function translate(key: string, lang: SupportedLanguage): string {
  const translation = translations[key.toLowerCase()];
  if (!translation || !translation[lang]) {
    return key;
  }
  return translation[lang] as string;
}

export function pickData(
  data: AnyObject,
  path: string,
  lang?: SupportedLanguage
): AnyObject | null {
  const target = _.get(data, path);
  if (!target) {
    return null;
  }
  if (lang) {
    return target[lang] || null;
  }
  return target || null;
}

export function getStatus(
  source: RawStatusHistory | RawData,
  lang: SupportedLanguage = 'fi'
): string {
  const status = ((source as RawData).status || source) as RawStatus | string;
  if (!status) {
    return 'no status';
  }
  if (typeof status === 'object') {
    const rawStatus = status;
    if (
      rawStatus.status_display_values &&
      rawStatus.status_display_values[lang]
    ) {
      return rawStatus.status_display_values[lang] as string;
    }
    return rawStatus.value ? translate(rawStatus.value, lang) : 'no status';
  }
  return translate(status, lang);
}

export function getTitle(
  source: RawData,
  lang: SupportedLanguage = 'fi'
): string {
  if (source.human_readable_type && source.human_readable_type[lang]) {
    return source.human_readable_type[lang] as string;
  }
  return source.type || 'unknown';
}

export function getStatusType(source: RawStatusHistory | RawData): StatusType {
  return 'unknown';
}

export function convertTimestampToMMDDYYYY(timestamp?: string): string {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('fi', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function convertActivity(rawData: RawActivity): Activity {
  return {
    title: rawData.title?.fi || '',
    created: convertTimestampToMMDDYYYY(rawData.activity_timestamp),
    message: rawData.message?.fi,
    link: rawData.activity_links?.fi,
    uid: '1',
    actionRequired: false,
  };
}

export function convertStatusHistory(rawData: RawStatusHistory): History {
  return {
    created: convertTimestampToMMDDYYYY(rawData.timestamp),
    status: getStatus(rawData),
    statusType: getStatusType(rawData),
    activities: rawData.activities?.map(convertActivity),
    key: createKey('historyItem'),
  };
}

export function convertData(rawData: RawData): Document {
  return {
    id: rawData.id,
    created: convertTimestampToMMDDYYYY(rawData.created_at),
    updated: convertTimestampToMMDDYYYY(rawData.updated_at),
    status: getStatus(rawData),
    history: rawData.status_histories
      ? rawData.status_histories.map(convertStatusHistory)
      : [],
    type: rawData.human_readable_type.fi || 'unknown',
    service: rawData.service,
    attachments: rawData.attachments,
    contentType: 'unknown',
    title: getTitle(rawData),
    statusType: getStatusType(rawData),
    actionRequired: false,
    content: rawData.content,
  };
}

export function splitMultipleActivities(historyItems: History[]): History[] {
  const returnArray: History[] = [];
  historyItems.forEach(historyItem => {
    if (historyItem.activities.length < 2) {
      returnArray.push(historyItem);
      return;
    }
    historyItem.activities.forEach(activity => {
      returnArray.push({
        ...historyItem,
        activities: [activity],
      });
    });
  });
  return returnArray;
}

export function splitDocumentHistory(documents: Document[]): Document[] {
  return documents.map(document => ({
    ...document,
    history: splitMultipleActivities(document.history),
  }));
}

export function convertResults(rawData: RawResults): Document[] {
  return splitDocumentHistory(rawData.results.map(convertData));
}
