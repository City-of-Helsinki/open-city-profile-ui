import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { ReactComponent as HelsinkiLogo } from '../svg/HelsinkiLogo.svg';
import { ReactComponent as HamburgerMenu } from '../svg/HamburgerMenu.svg';
import { ReactComponent as Close } from '../svg/Close.svg';
import styles from './Header.module.css';
import responsive from '../cssHelpers/responsive.module.css';
import LanguageSwitcher from '../../i18n/components/languageSwitcher/LanguageSwitcher';

type Props = {};

function Header(props: Props) {
  const { t } = useTranslation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  return (
    <header className={styles.header}>
      <div className={classNames(styles.inner, responsive.maxWidthCentered)}>
        <HelsinkiLogo className={styles.logo} aria-label="Helsinki logo" />
        <span className={`${styles.appName}`}>{t('appName')}</span>
        <section className={styles.navigation}>
          {isNavOpen ? (
            <Close
              className={styles.navigationControl}
              onClick={() => setIsNavOpen(false)}
            />
          ) : (
            <HamburgerMenu
              className={styles.navigationControl}
              onClick={() => setIsNavOpen(true)}
            />
          )}
          <div
            className={classNames(styles.navigationItems, {
              [styles.navigationItemsOpen]: isNavOpen,
            })}
          >
            <LanguageSwitcher onLanguageChanged={() => setIsNavOpen(false)} />
          </div>
        </section>
      </div>
    </header>
  );
}

export default Header;
