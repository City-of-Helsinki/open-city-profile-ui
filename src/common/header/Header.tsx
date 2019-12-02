import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { ReactComponent as HelsinkiLogo } from '../svg/HelsinkiLogo.svg';
import styles from './Header.module.css';
import responsive from '../cssHelpers/responsive.module.css';

type Props = {};

function Header(props: Props) {
  const { t } = useTranslation();
  return (
    <header className={styles.header}>
      <div className={classNames(styles.inner, responsive.maxWidthCentered)}>
        <HelsinkiLogo className={styles.logo} aria-label="Helsinki logo" />
        <span className={`${styles.appName}`}>{t('appName')}</span>
      </div>
    </header>
  );
}

export default Header;
