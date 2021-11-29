import { TFunction } from 'i18next';

import {
  commonConsents,
  ConsentList,
  ConsentObject,
  COOKIE_EXPIRATION_TIME,
} from './cookieConsentController';

type ConsentInfo = {
  titleTranslationKey?: string;
  textTranslationKey?: string;
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

const expirationTimeSession = -1;
const expirationTimeHour = 60 * 60;
const expirationTimeDay = expirationTimeHour * 24;
const expirationTimeYear = expirationTimeDay * 365;

const tunnistusUrl = 'tunnistus.hel.fi';
const profileUrl = 'profiili.hel.fi';
const ssoUrl = 'api.hel.fi/sso';
const allHelSubdomains = '*.hel.fi';

const generalAuthenticationTranslationKey = 'generalAuthenticationText';
const generalLocaleTranslationKey = 'generalLocaleText';
const generalSecuriryTranslationKey = 'generalSecurityText';

export function getExpirationTimeTranslation(
  expirationTimeInSeconds: number,
  t: TFunction
): string {
  if (expirationTimeInSeconds === expirationTimeSession) {
    return t('cookies.expirationTimeSession');
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
    titleTranslationKey: 'cookies.technicalRoutingTitle',
    expirationTimeInSeconds: expirationTimeSession,
    provider: allHelSubdomains,
  },
  AUTH_SESSION_ID: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: tunnistusUrl,
    textTranslationKey: generalAuthenticationTranslationKey,
  },
  AUTH_SESSION_ID_LEGACY: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: tunnistusUrl,
    textTranslationKey: generalAuthenticationTranslationKey,
  },
  KEYCLOAK_SESSION: {
    expirationTimeInSeconds: expirationTimeHour * 10,
    provider: tunnistusUrl,
    textTranslationKey: generalAuthenticationTranslationKey,
  },
  KEYCLOAK_SESSION_LEGACY: {
    expirationTimeInSeconds: expirationTimeHour * 10,
    provider: tunnistusUrl,
    textTranslationKey: generalAuthenticationTranslationKey,
  },
  KEYCLOAK_IDENTITY: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: tunnistusUrl,
    textTranslationKey: generalAuthenticationTranslationKey,
  },
  KEYCLOAK_IDENTITY_LEGACY: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: tunnistusUrl,
    textTranslationKey: generalAuthenticationTranslationKey,
  },
  KC_RESTART: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: tunnistusUrl,
    textTranslationKey: generalAuthenticationTranslationKey,
  },
  KEYCLOAK_REMEMBER_ME: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: tunnistusUrl,
    textTranslationKey: generalAuthenticationTranslationKey,
  },
  'sso-sessionid': {
    expirationTimeInSeconds: expirationTimeSession,
    provider: ssoUrl,
    textTranslationKey: generalAuthenticationTranslationKey,
  },
  KEYCLOAK_LOCALE: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: tunnistusUrl,
    textTranslationKey: generalLocaleTranslationKey,
  },
  i18next: {
    expirationTimeInSeconds: expirationTimeSession,
    provider: profileUrl,
    textTranslationKey: generalLocaleTranslationKey,
  },
  'sso-csrftoken': {
    expirationTimeInSeconds: expirationTimeYear,
    provider: ssoUrl,
    textTranslationKey: generalSecuriryTranslationKey,
  },
  'profiili-test-csrftoken': {
    expirationTimeInSeconds: expirationTimeYear,
    provider: profileUrl,
    textTranslationKey: generalSecuriryTranslationKey,
  },
};

export const optionalConsentsInfo: Record<string, ConsentInfo> = {
  [commonConsents.matomo]: {
    titleTranslationKey: 'cookies.matomo',
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

  return Object.entries(list).map(([key, info]) => {
    const text = t(`cookies.${info.textTranslationKey || `${key}Text`}`);
    return {
      id: key,
      title: info.titleTranslationKey ? t(info.titleTranslationKey) : key,
      text,
      ariaInputLabel: t(`cookies.${key}AriaInputText`, {
        consentText: text,
      }),
      duration: getExpirationTimeTranslation(info.expirationTimeInSeconds, t),
      provider: info.provider,
      value: currentConsents ? currentConsents[key] === true : false,
    };
  });
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
