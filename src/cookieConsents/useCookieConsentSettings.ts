import { CookieConsentChangeEvent, CookieConsentReactProps } from 'hds-react';
import { useTranslation } from 'react-i18next';

import siteSettings from './siteSettings.json';
import { PAGE_HEADER_ID } from '../common/constants';
import getLanguageCode from '../common/helpers/getLanguageCode';

const useCookieConsentSettings = () => {
  const { i18n } = useTranslation();
  const currentLanguage = getLanguageCode(i18n.language);

  const cookieConsentProps: CookieConsentReactProps = {
    onChange: (changeEvent: CookieConsentChangeEvent) => {
      const { acceptedGroups } = changeEvent;

      const hasStatisticsConsent = acceptedGroups.indexOf('statistics') > -1;

      if (hasStatisticsConsent) {
        //  start tracking
        window._paq.push(['setConsentGiven']);
        window._paq.push(['setCookieConsentGiven']);
      } else {
        // tell matomo to forget conset
        window._paq.push(['forgetConsentGiven']);
      }
    },
    siteSettings,
    options: {
      focusTargetSelector: `#${PAGE_HEADER_ID}`,
      language: currentLanguage,
    },
  };

  return cookieConsentProps;
};

export default useCookieConsentSettings;
