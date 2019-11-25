import React from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as HelsinkiLogo } from '../svg/HelsinkiLogo.svg';
import styles from './Header.module.css';

type Props = {};

function Header(props: Props) {
  const { t } = useTranslation();
  return (
    <header className={styles.header}>
      <HelsinkiLogo />
      <span className={`${styles.appName}`}>{t('appName')}</span>
    </header>
  );
}

export default Header;
