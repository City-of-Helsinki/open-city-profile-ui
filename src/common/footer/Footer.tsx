import React from 'react';
import { useTranslation } from 'react-i18next';

import HelsinkiLogo from '../helsinkiLogo/HelsinkiLogo';
import Copyright from '../copyright/Copyright';
import styles from './Footer.module.css';
import FooterLinks from '../footerLinks/FooterLinks';
import NewWindowLink from '../newWindowLink/NewWindowLink';

type Props = {
  hideFooterLogo?: boolean;
};

function Footer(props: Props): React.ReactElement {
  const { t } = useTranslation();
  return (
    <footer className={styles['footer']}>
      <div className={styles['content']}>
        {!props.hideFooterLogo && <HelsinkiLogo className={styles['logo']} />}
        <div className={styles['text-container']}>
          <div>
            <Copyright />
            <FooterLinks className={styles['links']} />
          </div>
          <NewWindowLink
            link={t('footer.feedbackLink')}
            title={t('footer.feedback')}
            className={styles['feedback']}
          />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
