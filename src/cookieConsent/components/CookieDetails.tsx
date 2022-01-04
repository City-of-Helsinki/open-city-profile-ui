import React from 'react';
import { useTranslation } from 'react-i18next';

import { ConsentController, ConsentObject } from '../cookieConsentController';
import CookieToggler from './CookieToggler';
import styles from './CookieConsent.module.css';
import RequiredCookieInformation from './RequiredCookieInformation';
import { getConsentInfo } from '../consents';

export type CookieDetailProps = {
  requiredConsents: ConsentObject;
  optionalConsents: ConsentObject;
  onChange: ConsentController['update'];
  isOnSettingsPage?: boolean;
};

function CookieDetails({
  optionalConsents,
  onChange,
  isOnSettingsPage,
}: CookieDetailProps): React.ReactElement {
  const { t } = useTranslation();
  const Heading = ({
    level,
    children,
  }: {
    level: number;
    children: React.ReactNode;
  }) => {
    if (isOnSettingsPage) {
      return level === 1 ? <h2>{children}</h2> : <h3>{children}</h3>;
    }
    return (
      <span
        className={styles[`emulated-h${level}`]}
        role="heading"
        aria-level={level}
        id="cookie-consent-active-heading"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        {children}
      </span>
    );
  };
  return (
    <div
      className={styles['text-content']}
      data-testid="cookie-consent-details"
    >
      <Heading level={1}>{t('cookies.detailsTitle')}</Heading>
      <p>{t('cookies.detailsText')}</p>
      <Heading level={2}>{t('cookies.requiredConsentsTitle')}</Heading>
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
        </React.Fragment>
      )}
    </div>
  );
}

export default CookieDetails;
