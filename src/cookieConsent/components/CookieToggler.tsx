import React from 'react';
import { Checkbox } from 'hds-react';

import styles from './CookieConsent.module.css';
import { ConsentController } from '../cookieConsentController';
import { ConsentData } from '../consents';

export type CookieTogglerProps = {
  consentList: ConsentData[];
  onChange: ConsentController['update'];
};

type ConsentDataForCheckbox = {
  id: string;
  checked: boolean;
  text: string;
  ariaLabel: string;
  onToggle: () => void;
};

function CookieToggler({
  consentList,
  onChange,
}: CookieTogglerProps): React.ReactElement {
  const list = consentList.map<ConsentDataForCheckbox>(data => ({
    id: `optional-cookie-consent-${data.id}`,
    checked: data.value,
    text: data.text,
    ariaLabel: data.ariaInputLabel,
    onToggle: () => {
      onChange(data.id, !data.value);
    },
  }));
  return (
    <ul className={styles['list']}>
      {list.map(data => (
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
