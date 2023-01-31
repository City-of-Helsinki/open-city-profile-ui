import { ContentSource, CookieModal } from 'hds-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import getLanguageCode from '../common/helpers/getLanguageCode';
import { handleCookieConsentChange } from '../common/helpers/tracking/matomoTracking';
import config from '../config';
import { getCookieContent } from './cookieContentSource';

function CookieConsentModal(): React.ReactElement | null {
  const { i18n } = useTranslation();
  const currentLanguage = getLanguageCode(
    i18n.language
  ) as ContentSource['currentLanguage'];
  const { t, changeLanguage } = i18n;
  const location = useLocation();
  const currentPath = location.pathname;
  const disallowedPaths = [config.autoSSOLoginPath, config.cookiePagePath];
  const contentSource: ContentSource = useMemo(
    () => ({
      ...getCookieContent(t),
      currentLanguage,
      focusTargetSelector: 'h1',
      language: {
        onLanguageChange: changeLanguage,
      },
      onAllConsentsGiven: handleCookieConsentChange,
      onConsentsParsed: handleCookieConsentChange,
    }),
    [currentLanguage, changeLanguage, t]
  );

  if (disallowedPaths.includes(currentPath)) {
    return null;
  }

  return <CookieModal contentSource={contentSource} />;
}

export default CookieConsentModal;
