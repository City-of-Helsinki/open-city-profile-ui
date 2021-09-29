import { Button } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './CookieConsent.module.css';
export type CookieButtonsProps = {
  onReadMore?: () => void;
  onApproveAll: () => void;
  onApproveRequired: () => void;
};

function CookieButtons({
  onReadMore,
  onApproveAll,
  onApproveRequired,
}: CookieButtonsProps): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div className={styles['buttons']}>
      <Button
        variant="primary"
        onClick={() => {
          onApproveAll();
        }}
        data-testid="cookie-consent-approve-all-button"
      >
        {t('cookies.approveAll')}
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          onApproveRequired();
        }}
        data-testid="cookie-consent-approve-required-button"
        aria-label={t('cookies.approveRequiredAriaLabel')}
      >
        {t('cookies.approveRequired')}
      </Button>
      {onReadMore && (
        <Button
          variant="secondary"
          onClick={() => {
            onReadMore();
          }}
          data-testid="cookie-consent-read-more-button"
        >
          {t('cookies.cookieSettings')}
        </Button>
      )}
    </div>
  );
}

export default CookieButtons;
