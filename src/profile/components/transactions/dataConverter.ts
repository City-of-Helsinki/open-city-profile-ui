import _ from 'lodash';
import { AnyObject } from 'yup/lib/types';

import { Activity, RawActivity, RawData, SupportedLanguage, Document } from '.';

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
    timestamp: convertTimestampToMMDDYYYY(rawData.activity_timestamp),
    message: rawData.message?.fi,
    link: rawData.activity_links?.fi,
    uid: '1',
    contentType: 'unknown',
    status: 'unknown',
    actionRequired: false,
  };
}

export function convertData(rawData: RawData): Document {
  const data: Partial<Document> = {
    id: rawData.id,
    createdt: convertTimestampToMMDDYYYY(rawData.created_at),
    updated: convertTimestampToMMDDYYYY(rawData.updated_at),
    status: rawData.status.status_display_values?.fi,
    activities: rawData.activities.map(convertActivity),
    type: rawData.human_readable_type.fi,
    service: rawData.service,
    attachments: rawData.attachments,
  };

  return data as Document;
}
