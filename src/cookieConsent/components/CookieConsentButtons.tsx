import { Button } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './CookieConsent.module.css';
export type CookieButtonsProps = {
  onApproveAll?: () => void;
  onApproveRequired: () => void;
  onApproveSelectionsAndRequired?: () => void;
};

function CookieButtons({
  onApproveAll,
  onApproveRequired,
  onApproveSelectionsAndRequired,
}: CookieButtonsProps): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div className={styles['buttons']}>
      {!!onApproveSelectionsAndRequired && (
        <Button
          variant="primary"
          onClick={() => {
            onApproveSelectionsAndRequired();
          }}
          data-testid="cookie-consent-approve-selections-button"
        >
          {t('cookies.approveSelected')}
        </Button>
      )}
      {!!onApproveAll && (
        <Button
          variant={!!onApproveSelectionsAndRequired ? 'secondary' : 'primary'}
          onClick={() => {
            onApproveAll();
          }}
          data-testid="cookie-consent-approve-all-button"
        >
          {t('cookies.approveAll')}
        </Button>
      )}
      <Button
        variant="secondary"
        onClick={() => {
          onApproveRequired();
        }}
        data-testid="cookie-consent-approve-required-button"
      >
        {t('cookies.approveRequired')}
      </Button>
    </div>
  );
}

export default CookieButtons;
