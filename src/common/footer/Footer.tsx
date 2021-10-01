import React from 'react';
import { useTranslation } from 'react-i18next';
import { Footer as HDSFooter, IconLinkExternal } from 'hds-react';
import { Link } from 'react-router-dom';

import styles from './Footer.module.css';
import getLanguageCode from '../helpers/getLanguageCode';

function Footer(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const lang = getLanguageCode(i18n.languages[0]);
  const logoLanguage = lang === 'sv' ? 'sv' : 'fi';

  const createAriaLabel = (title: string) => {
    const titleWithoutLastDot =
      title.slice(-1) === '.' ? title.substr(0, title.length - 1) : title;
    return t('opensInNewWindow', {
      title: titleWithoutLastDot,
    });
  };

  return (
    <HDSFooter
      theme="dark"
      title={t('appName')}
      logoLanguage={logoLanguage}
      className={styles['custom-theme']}
    >
      <HDSFooter.Utilities backToTopLabel={t('footer.backToTop')}>
        <HDSFooter.Item
          href={t('footer.contactUsLink')}
          label={t('footer.contactUs')}
          aria-label={createAriaLabel(t('footer.contactUs'))}
          className={styles['link-with-icon']}
          target="_blank"
        >
          <IconLinkExternal aria-hidden size={'s'} />
        </HDSFooter.Item>
        <HDSFooter.Item
          href={t('footer.feedbackLink')}
          label={t('footer.feedback')}
          aria-label={createAriaLabel(t('footer.feedback'))}
          className={styles['link-with-icon']}
          target="_blank"
        >
          <IconLinkExternal aria-hidden size={'s'} />
        </HDSFooter.Item>
      </HDSFooter.Utilities>
      <HDSFooter.Base
        copyrightHolder={t('cityOfHelsinki')}
        copyrightText={t('footer.reserveRights')}
      >
        <HDSFooter.Item
          href={t('profileForm.termsFileDescriptionLink')}
          label={t('footer.privacy')}
          aria-label={createAriaLabel(t('footer.privacy'))}
          className={styles['base-link-with-icon']}
          target="_blank"
        >
          <IconLinkExternal aria-hidden size={'xs'} />
        </HDSFooter.Item>
        <HDSFooter.Item
          as={Link}
          to="/accessibility"
          title={t('footer.accessibility')}
        >
          {t('footer.accessibility')}
        </HDSFooter.Item>
      </HDSFooter.Base>
    </HDSFooter>
  );
}

export default Footer;
