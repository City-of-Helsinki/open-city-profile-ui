import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './CookieConsent.module.css';
export type CookieMainInformationProps = {
  onReadMore: () => void;
};

function CookieMainInformation({
  onReadMore,
}: CookieMainInformationProps): React.ReactElement {
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
        {t('cookies.informationText')}
        &nbsp;
        <button
          className={styles['plain-text-button']}
          onClick={() => onReadMore()}
          data-testid="cookie-consent-read-more-text-button"
        >
          {t('cookies.showCookies')}
        </button>
      </p>
    </div>
  );
}

export default CookieMainInformation;
