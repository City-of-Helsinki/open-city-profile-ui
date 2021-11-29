import React from 'react';

import styles from './CookieConsent.module.css';
import { ConsentData } from '../consents';

function RequiredCookieInformation({
  consentList,
}: {
  consentList: ConsentData[];
}): React.ReactElement {
  return (
    <ul className={styles['list']}>
      {consentList.map(data => (
        <li key={data.id} data-testid={data.id}>
          <span>
            <strong>{data.title}:</strong> {data.text} {data.duration}{' '}
            {data.provider}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default RequiredCookieInformation;
