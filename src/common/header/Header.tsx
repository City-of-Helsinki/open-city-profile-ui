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
            {/* The language switcher is a navigation element. Because */}
            {/* there's a possibility that we have multiple navs on */}
            {/* the same page, we need to give the element a label to */}
            {/* distinct it from the other navs. */}
            <nav aria-label={t('landmarks.navigation.language')}>
              <LanguageSwitcher />
            </nav>
            <nav aria-label={t('landmarks.navigation.user')}>
              <UserDropdown />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
