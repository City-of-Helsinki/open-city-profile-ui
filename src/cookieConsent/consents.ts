import { TFunction } from 'i18next';

import {
  commonConsents,
  ConsentList,
  ConsentObject,
  COOKIE_EXPIRATION_TIME,
} from './cookieConsentController';

type ConsentInfo = {
  nameTranslationKey?: string;
  descriptionTranslationKey?: string;
  expirationTimeInSeconds: number;
  provider: string;
};

export type ConsentData = {
  id: string;
  title: string;
  text: string;
  ariaInputLabel: string;
  duration: string;
  provider: string;
  value: boolean;
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

const tunnistusUrl = 'tunnistus.hel.fi';
const profileUrl = 'profiili.hel.fi';
const ssoUrl = 'api.hel.fi/sso';
const allHelSubdomains = '*.hel.fi';

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
    return t('hours', { count });
  } else if (expirationTimeInSeconds < expirationTimeYear) {
    const count = Math.round(expirationTimeInSeconds / expirationTimeDay);
    return t('days', { count });
  } else {
    const count = Math.round(expirationTimeInSeconds / expirationTimeYear);
    return t('years', { count });
  }
}

export const requiredConsentsInfo: Record<string, ConsentInfo> = {
  [commonConsents.consents]: {
    expirationTimeInSeconds: COOKIE_EXPIRATION_TIME,
    provider: allHelSubdomains,
  },
  technicalRouting: {
    nameTranslationKey: 'cookieConsent.technicalRouting',
    expirationTimeInSeconds: expirationTimeSession,
    provider: allHelSubdomains,
  },
  AUTH_SESSION_ID: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: tunnistusUrl,
  },
  AUTH_SESSION_ID_LEGACY: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: tunnistusUrl,
  },
  KEYCLOAK_SESSION: {
    expirationTimeInSeconds: expirationTimeHour * 10,
    provider: tunnistusUrl,
  },
  KEYCLOAK_SESSION_LEGACY: {
    expirationTimeInSeconds: expirationTimeHour * 10,
    provider: tunnistusUrl,
  },
  KEYCLOAK_IDENTITY: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: tunnistusUrl,
  },
  KEYCLOAK_IDENTITY_LEGACY: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: tunnistusUrl,
  },
  KC_RESTART: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: tunnistusUrl,
  },
  KEYCLOAK_REMEMBER_ME: {
    expirationTimeInSeconds: expirationTimeNever,
    provider: tunnistusUrl,
  },
  KEYCLOAK_LOCALE: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: tunnistusUrl,
  },
  'sso-sessionid': {
    expirationTimeInSeconds: expirationTimeSession,
    provider: ssoUrl,
  },
  'sso-csrftoken': {
    expirationTimeInSeconds: expirationTimeYear,
    provider: ssoUrl,
  },
  i18next: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: profileUrl,
  },
  'profiili-test-csrftoken': {
    expirationTimeInSeconds: expirationTimeYear,
    provider: profileUrl,
  },
};

export const optionalConsentsInfo: Record<string, ConsentInfo> = {
  [commonConsents.matomo]: {
    nameTranslationKey: 'cookieConsent.matomo',
    expirationTimeInSeconds: expirationTimeYear,
    provider: profileUrl,
  },
};

export function getConsentInfo(
  target: 'required' | 'optional',
  t: TFunction,
  currentConsents?: ConsentObject
): ConsentData[] {
  const list =
    target === 'required' ? requiredConsentsInfo : optionalConsentsInfo;

  return Object.entries(list).map(([key, info]) => ({
    id: key,
    title: info.nameTranslationKey ? t(info.nameTranslationKey) : key,
    text: t(`cookies.${key}Text`),
    ariaInputLabel: t(`cookies.${key}AriaInputText`, {
      consentText: t(`cookies.${key}Text`),
    }),
    duration: getExpirationTimeTranslation(info.expirationTimeInSeconds, t),
    provider: info.provider,
    value: currentConsents ? currentConsents[key] === true : false,
  }));
}

export function getRequiredAndOptionalConsentKeys(): Consents {
  const requiredConsents = Object.keys(requiredConsentsInfo);
  const optionalConsents = Object.keys(optionalConsentsInfo);
  return {
    requiredConsents,
    optionalConsents,
  };
}

export function hasConsentForMatomo(consents: ConsentObject): boolean {
  return consents[commonConsents.matomo] === true;
}
