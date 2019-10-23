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
      <h1 className={styles.appName}>{t('appName')}</h1>
    </header>
  );
}

export default Header;
