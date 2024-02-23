import React from 'react';
import { useTranslation } from 'react-i18next';
import { Logo, logoFi, logoSv } from 'hds-react';

import styles from './HelsinkiLogo.module.css';
import getLanguageCode from '../helpers/getLanguageCode';

function HelsinkiLogo(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const lang = getLanguageCode(i18n.languages[0]);
  const logoSrc = lang === 'sv' ? logoSv : logoFi;
  const altText = t('helsinkiLogo');

  return (
    <div className={styles.logoWrapper}>
      <Logo
        src={logoSrc}
        size="full"
        alt={altText}
        data-testid={'helsinki-logo'}
      />
    </div>
  );
}

export default HelsinkiLogo;
