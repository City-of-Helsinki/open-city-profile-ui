import { ContentSource, CookiePage } from 'hds-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import PageLayout from '../common/pageLayout/PageLayout';
import { getCookieContent } from './cookieContentSource';
import commonContentStyles from '../common/cssHelpers/content.module.css';
import { handleCookieConsentChange } from '../common/helpers/tracking/matomoTracking';
import getLanguageCode from '../common/helpers/getLanguageCode';

function CookieConsentPage(): React.ReactElement | null {
  const { i18n } = useTranslation();
  const currentLanguage = getLanguageCode(
    i18n.language
  ) as ContentSource['currentLanguage'];
  const { t } = i18n;
  const contentSource: ContentSource = useMemo(
    () => ({
      ...getCookieContent(t),
      currentLanguage,
      onAllConsentsGiven: handleCookieConsentChange,
    }),
    [currentLanguage, t]
  );

  return (
    <PageLayout title={'cookies.pageName'}>
      <div
        className={classNames([
          commonContentStyles['common-content-area'],
          commonContentStyles['common-bottom-padding'],
        ])}
      >
        <CookiePage contentSource={contentSource} />
      </div>
    </PageLayout>
  );
}

export default CookieConsentPage;
