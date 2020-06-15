import React from 'react';
import { useTranslation } from 'react-i18next';

import HelsinkiLogo from '../helsinkiLogo/HelsinkiLogo';
import Copyright from '../copyright/Copyright';
import styles from './Footer.module.css';
import FooterLinks from '../footerLinks/FooterLinks';

type Props = {
  hideFooterLogo?: boolean;
};

function Footer(props: Props) {
  const { t } = useTranslation();
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        {!props.hideFooterLogo && <HelsinkiLogo className={styles.logo} />}
        <div className={styles.textContainer}>
          <div>
            <Copyright />
            <FooterLinks className={styles.links} />
          </div>
          <a
            href={t('footer.feedbackLink')}
            target="_blank"
            rel="noreferrer noopener"
            className={styles.feedback}
          >
            {t('footer.feedback')}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
