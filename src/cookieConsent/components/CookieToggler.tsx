import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from 'hds-react';

import styles from './CookieConsent.module.css';
import { ConsentController, ConsentObject } from '../cookieConsentController';

export type CookieTogglerProps = {
  consents: ConsentObject;
  isRequired: boolean;
  onChange: ConsentController['update'];
};
type ConsentData = {
  id: string;
  checked: boolean;
  text: string;
  ariaLabel: string;
  onToggle: () => void;
};
type ConsentList = ConsentData[];

function CookieToggler({
  consents,
  onChange,
}: CookieTogglerProps): React.ReactElement {
  const { t } = useTranslation();
  const consentEntries = Object.entries(consents);
  const consentList: ConsentList = consentEntries.map<ConsentData>(
    ([key, value]) => ({
      id: `optional-cookie-consent-${key}`,
      checked: Boolean(value),
      text: t(`cookies.${key}Text`),
      ariaLabel: t(`cookies.${key}AriaInputText`, {
        consentText: t(`cookies.${key}Text`),
      }),
      onToggle: () => {
        onChange(key, !value);
      },
    })
  );
  return (
    <ul className={styles['list']}>
      {consentList.map(data => (
        <li key={data.id}>
          <Checkbox
            onChange={data.onToggle}
            id={data.id}
            name={data.id}
            checked={data.checked}
            data-testid={data.id}
            aria-label={data.ariaLabel}
            label={data.text}
          />
        </li>
      ))}
    </ul>
  );
}

export default CookieToggler;
