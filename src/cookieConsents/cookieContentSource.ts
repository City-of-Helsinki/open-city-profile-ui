import { ContentSource } from 'hds-react';
import { TFunction } from 'react-i18next';

export const trackingCookieId = 'matomo';

export function getCookieContent(
  t: TFunction
): Pick<
  ContentSource,
  'requiredCookies' | 'optionalCookies' | 'texts' | 'siteName'
> {
  const securityCookieDescription = t('cookies.securityCookieDescription');
  const loadBalancerCookieName = t('cookies.loadBalancerCookieName');
  const loadBalancerCookieDescription = t(
    'cookies.loadBalancerCookieDescription'
  );
  const languageCookieDescription = t('cookies.languageCookieDescription');
  const trackingCookieDescription = t('cookies.trackingCookieDescription');
  const consentStorageDescription = t('cookies.consentStorageDescription');
  const sessionExpiration = t('cookies.sessionExpiration');
  const daysPlural = t('cookies.daysPlural');
  const minutesPlural = t('cookies.minutesPlural');
  const mainText = t('cookies.mainText');
  const siteName = t('appName');

  const tunnistusHostName = 'tunnistus.hel.fi';
  const profiiliHostName = 'profiili.hel.fi';
  const tunnistamoAndProfileBeHostName = 'api.hel.fi';
  const anyHelFiHostName = '*.hel.fi';

  return {
    siteName,
    texts: {
      sections: {
        main: {
          text: mainText,
        },
      },
    },
    requiredCookies: {
      groups: [
        { commonGroup: 'tunnistamoLogin' },
        {
          commonGroup: 'informationSecurity',
          cookies: [
            {
              id: 'tunnistamo-csrftoken',
              name: 'tunnistamo_prod-csrftoken',
              hostName: tunnistamoAndProfileBeHostName,
              description: securityCookieDescription,
              expiration: `365 ${daysPlural}`,
            },
            {
              id: 'profiili-csrftoken',
              name: 'profiili-prod-csrftoken',
              hostName: tunnistamoAndProfileBeHostName,
              description: securityCookieDescription,
              expiration: `365 ${daysPlural}`,
            },
          ],
        },
        {
          commonGroup: 'language',
          cookies: [
            { commonCookie: 'keycloak-language' },
            { commonCookie: 'suomifi-language' },
            {
              id: 'profile-language',
              name: 'i18next',
              hostName: profiiliHostName,
              description: languageCookieDescription,
              expiration: sessionExpiration,
            },
          ],
        },
        {
          commonGroup: 'loadBalancing',
          cookies: [
            {
              id: 'loadbalancer',
              name: loadBalancerCookieName,
              hostName: `${profiiliHostName}, ${tunnistamoAndProfileBeHostName}, ${tunnistusHostName}`,
              description: loadBalancerCookieDescription,
              expiration: sessionExpiration,
            },
          ],
        },
      ],
    },
    optionalCookies: {
      groups: [
        {
          commonGroup: 'statistics',
          cookies: [
            {
              commonCookie: trackingCookieId,
            },
            {
              id: 'matomo-session',
              name: '_pk_ses*',
              hostName: anyHelFiHostName,
              description: trackingCookieDescription,
              expiration: `30 ${minutesPlural}`,
            },
            {
              id: 'matomo-cookie-consent',
              name: 'mtm_.*',
              hostName: anyHelFiHostName,
              description: consentStorageDescription,
              expiration: `400 ${daysPlural}`,
            },
          ],
        },
      ],
    },
  };
}
