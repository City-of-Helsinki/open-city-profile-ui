import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './CookieConsent.module.css';

function CookieMainInformation(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div
      className={styles['text-content']}
      data-testid="cookie-consent-information"
    >
      <span
        className={styles['emulated-h1']}
        role="heading"
        aria-level={1}
        id="cookie-consent-active-heading"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        {t('cookies.informationTitle')}
      </span>

      <p id="cookie-consent-description">
        {t('cookies.informationText')} {t('cookies.settingsDescription')}
      </p>
    </div>
  );
}

export default CookieMainInformation;
