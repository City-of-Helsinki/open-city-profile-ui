import React, { useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import useAuthenticate from '../../auth/useAuthenticate';
import { isAuthenticatedSelector } from '../../auth/redux';
import { ReactComponent as HamburgerMenu } from '../svg/HamburgerMenu.svg';
import { ReactComponent as Close } from '../svg/Close.svg';
import styles from './FullscreenNavigation.module.css';
import LanguageSwitcher from '../../i18n/components/languageSwitcher/LanguageSwitcher';

type Props = {
  className?: string;
};

function FullscreenNavigation(props: Props) {
  const { t } = useTranslation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [authenticate, logout] = useAuthenticate();

  const isAuthenticated = useSelector(isAuthenticatedSelector);

  const closeNav = () => {
    setIsNavOpen(false);
  };

  return (
    <div className={classNames(props.className)}>
      {!isNavOpen && (
        <HamburgerMenu
          className={styles.navigationToggle}
          onClick={() => setIsNavOpen(true)}
        />
      )}
      <div className={isNavOpen ? styles.nav : styles.hidden}>
        <div className={styles.navControls}>
          <Close
            className={classNames(styles.navigationToggle, styles.closeNav)}
            onClick={closeNav}
          />
        </div>
        <div className={styles.navItems}>
          {isAuthenticated && (
            <React.Fragment>
              <NavLink to="/" className={styles.navLink} onClick={closeNav}>
                {t('nav.information')}
              </NavLink>
              <NavLink
                to="/connected-services"
                className={styles.navLink}
                onClick={closeNav}
              >
                {t('nav.services')}
              </NavLink>
            </React.Fragment>
          )}
          {isAuthenticated ? (
            <span
              role="button"
              className={styles.navLink}
              onClick={() => {
                setIsNavOpen(false);
                logout();
              }}
            >
              {t('nav.signout')}
            </span>
          ) : (
            <span
              role="button"
              className={styles.navLink}
              onClick={() => {
                setIsNavOpen(false);
                authenticate();
              }}
            >
              {t('nav.signin')}
            </span>
          )}

          <LanguageSwitcher
            className={styles.languageSwitcher}
            onLanguageChanged={closeNav}
          />
        </div>
      </div>
    </div>
  );
}

export default FullscreenNavigation;
