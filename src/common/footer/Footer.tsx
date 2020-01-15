import React from 'react';

import { ReactComponent as HelsinkiLogo } from '../svg/HelsinkiLogo.svg';
import Copyright from '../copyright/Copyright';
import styles from './Footer.module.css';
import responsive from '../cssHelpers/responsive.module.css';
import FooterLinks from '../footerLinks/FooterLinks';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={responsive.maxWidthCentered}>
        <HelsinkiLogo className={styles.logo} aria-label="Helsinki logo" />
        <div className={styles.textContainer}>
          <Copyright />
          <FooterLinks className={styles.links} />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
