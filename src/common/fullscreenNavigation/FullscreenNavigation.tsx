import React, { useState } from 'react';
import classNames from 'classnames';

import { ReactComponent as HamburgerMenu } from '../svg/HamburgerMenu.svg';
import { ReactComponent as Close } from '../svg/Close.svg';
import styles from './FullscreenNavigation.module.css';
import LanguageSwitcher from '../../i18n/components/languageSwitcher/LanguageSwitcher';

type Props = {
  className?: string;
};

function FullscreenNavigation(props: Props) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  return (
    <div className={classNames(props.className)}>
      {!isNavOpen && (
        <HamburgerMenu
          className={styles.navigationToggle}
          onClick={() => setIsNavOpen(true)}
        />
      )}
      <div className={styles.nav} hidden={!isNavOpen}>
        <div className={styles.navControls}>
          <Close
            className={classNames(styles.navigationToggle, styles.closeNav)}
            onClick={() => setIsNavOpen(false)}
          />
        </div>
        <div className={styles.navItems}>
          <LanguageSwitcher onLanguageChanged={() => setIsNavOpen(false)} />
        </div>
      </div>
    </div>
  );
}

export default FullscreenNavigation;
