import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'hds-react';

import { ConsentController, ConsentObject } from '../cookieConsentController';
import CookieToggler from './CookieToggler';
import styles from './CookieConsent.module.css';
import RequiredCookieInformation from './RequiredCookieInformation';
import { getConsentInfo } from '../consents';

export type CookieDetailProps = {
  requiredConsents: ConsentObject;
  optionalConsents: ConsentObject;
  onChange: ConsentController['update'];
  onClose: () => void;
  onApproveSelectionsAndRequired: () => void;
};

function CookieDetails({
  onClose,
  requiredConsents,
  optionalConsents,
  onChange,
  onApproveSelectionsAndRequired,
}: CookieDetailProps): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div
      className={styles['text-content']}
      data-testid="cookie-consent-details"
    >
      <span
        className={styles['emulated-h1']}
        role="heading"
        aria-level={1}
        id="cookie-consent-active-heading"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        {t('cookies.detailsTitle')}
      </span>
      <p>{t('cookies.detailsText')}</p>
      <span className={styles['emulated-h2']} role="heading" aria-level={2}>
        {t('cookies.requiredConsentsTitle')}
      </span>
      <p>{t('cookies.requiredConsentsText')}</p>
      <RequiredCookieInformation consentList={getConsentInfo('required', t)} />
      {optionalConsents && (
        <React.Fragment>
          <span className={styles['emulated-h2']} role="heading" aria-level={2}>
            {t('cookies.optionalConsentsAndDataGathering')}
          </span>
          <CookieToggler
            consentList={getConsentInfo('optional', t, optionalConsents)}
            onChange={onChange}
          />
          <Button
            variant="secondary"
            onClick={() => {
              onApproveSelectionsAndRequired();
            }}
            data-testid="cookie-consent-approve-selections-button"
          >
            {t('cookies.approveSelectionsAndRequired')}
          </Button>
        </React.Fragment>
      )}

      <p>
        <button
          className={styles['plain-text-button']}
          onClick={() => onClose()}
        >
          {t('cookies.backToBeginning')}
        </button>
      </p>
    </div>
  );
}

export default CookieDetails;
