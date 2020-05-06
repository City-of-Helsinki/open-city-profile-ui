import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { ReactComponent as HelsinkiLogo } from '../svg/HelsinkiLogo.svg';
import FullscreenNavigation from '../fullscreenNavigation/FullscreenNavigation';
import styles from './Header.module.css';
import responsive from '../cssHelpers/responsive.module.css';
import LanguageSwitcher from '../../i18n/components/languageSwitcher/LanguageSwitcher';
import UserDropdown from './userDropdown/UserDropdown';

function Header() {
  const { t } = useTranslation();
  return (
    <header className={styles.header}>
      <div className={classNames(styles.inner, responsive.maxWidthCentered)}>
        <HelsinkiLogo className={styles.logo} aria-label="Helsinki logo" />
        <span className={`${styles.appName}`}>{t('appName')}</span>
        <div className={styles.end}>
          <FullscreenNavigation className={styles.mobileNav} />
          <div className={styles.desktopNav}>
            <LanguageSwitcher />
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
