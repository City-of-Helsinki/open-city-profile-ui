import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './CookieConsent.module.css';
import { ConsentObject } from '../cookieConsentController';

export type RequiredCookieInformationProps = {
  consents: ConsentObject;
};
type ConsentData = {
  id: string;
  text: string;
  title: string;
};
type ConsentList = ConsentData[];

function RequiredCookieInformation({
  consents,
}: RequiredCookieInformationProps): React.ReactElement {
  const { t } = useTranslation();

  const consentEntries = Object.entries(consents);
  const consentList: ConsentList = consentEntries.map<ConsentData>(([key]) => ({
    id: `required-cookie-consent-${key}`,
    title: t(`cookies.${key}Title`),
    text: t(`cookies.${key}Text`),
  }));
  return (
    <ul className={styles['list']}>
      {consentList.map(data => (
        <li key={data.id} data-testid={data.id}>
          <span>
            <strong>{data.title}:</strong> {data.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default RequiredCookieInformation;
