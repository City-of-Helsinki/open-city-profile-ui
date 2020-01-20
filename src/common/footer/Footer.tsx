import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ReactComponent as HelsinkiLogo } from '../svg/HelsinkiLogo.svg';
import Copyright from '../copyright/Copyright';
import styles from './Footer.module.css';
import responsive from '../cssHelpers/responsive.module.css';
import FooterLinks from '../footerLinks/FooterLinks';

type Props = {
  hideFooterLogo?: boolean;
};

function Footer(props: Props) {
  const { t } = useTranslation();
  return (
    <footer className={styles.footer}>
      <div className={responsive.maxWidthCentered}>
        {!props.hideFooterLogo && (
          <HelsinkiLogo className={styles.logo} aria-label="Helsinki logo" />
        )}
        <div className={styles.textContainer}>
          <div>
            <Copyright />
            <FooterLinks className={styles.links} />
          </div>
          <Link to="/#" className={styles.feedback}>
            {t('footer.feedback')}
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
