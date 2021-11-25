import { TFunction } from 'i18next';

import {
  commonConsents,
  ConsentList,
  COOKIE_EXPIRATION_TIME,
} from './cookieConsentController';

type ConsentInfo = {
  descriptionTranslationKey?: string;
  expirationTimeInSeconds: number;
  providerUrl: string;
};

type Consents = {
  optionalConsents?: ConsentList;
  requiredConsents?: ConsentList;
};

export const expirationTimeNever = -1;
export const expirationTimeSession = 0;
export const expirationTimeHour = 60 * 60;
export const expirationTimeDay = expirationTimeHour * 24;
export const expirationTimeYear = expirationTimeDay * 365;

export function getExpirationTimeTranslation(
  expirationTimeInSeconds: number,
  t: TFunction
): string {
  if (expirationTimeInSeconds === expirationTimeNever) {
    return t('cookieConsent.expirationTimeNever');
  } else if (expirationTimeInSeconds === expirationTimeSession) {
    return t('cookieConsent.expirationTimeSession');
  } else if (expirationTimeInSeconds < expirationTimeDay) {
    const count = Math.round(expirationTimeInSeconds / expirationTimeHour);
    return t('cookieConsent.expirationHours', { count });
  } else if (expirationTimeInSeconds < expirationTimeYear) {
    const count = Math.round(expirationTimeInSeconds / expirationTimeDay);
    return t('cookieConsent.expirationDays', { count });
  } else {
    const count = Math.round(expirationTimeInSeconds / expirationTimeYear);
    return t('cookieConsent.expirationYears', { count });
  }
}

export const info: Record<string, ConsentInfo> = {
  [commonConsents.tunnistamo]: {
    expirationTimeInSeconds: 0,
    providerUrl: 'tunnistamo.hel.fi',
  },
  [commonConsents.consents]: {
    expirationTimeInSeconds: COOKIE_EXPIRATION_TIME,
    providerUrl: 'profiili.hel.fi',
  },
};

export const consents: Consents = {
  requiredConsents: [commonConsents.tunnistamo, commonConsents.language],
  optionalConsents: [
    commonConsents.matomo,
    commonConsents.preferences,
    commonConsents.marketing,
  ],
};
