import React from 'react';
import { useTranslation } from 'react-i18next';
// import { Footer as HDSFooter, IconLinkExternal } from 'hds-react';
import { Footer as HDS_footer, Logo, logoFiDark, logoSvDark } from 'hds-react';
import { Link } from 'react-router-dom';

import styles from './Footer.module.css';
import getLanguageCode from '../helpers/getLanguageCode';
import config from '../../config';

function Footer(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const lang = getLanguageCode(i18n.languages[0]);
  const logoSrcFromLanguage = lang === 'sv' ? logoSvDark : logoFiDark;

  const createAriaLabel = (title: string) => {
    const titleWithoutLastDot =
      title.slice(-1) === '.' ? title.substr(0, title.length - 1) : title;
    return t('opensInNewWindow', {
      title: titleWithoutLastDot,
    });
  };

  return (
    <HDS_footer theme="dark" title={t('appName')}>
      <HDS_footer.Utilities>
        <HDS_footer.Link
          aria-label={createAriaLabel(t('footer.contactUs'))}
          external
          href={t('footer.contactUsLink')}
          label={t('footer.contactUs')}
          target="_blank"
        />
        <HDS_footer.Link
          aria-label={createAriaLabel(t('footer.feedback'))}
          external
          href={t('footer.feedbackLink')}
          label={t('footer.feedback')}
          target="_blank"
        />
      </HDS_footer.Utilities>
      <HDS_footer.Base
        copyrightHolder={t('cityOfHelsinki')}
        copyrightText={t('footer.reserveRights')}
        backToTopLabel={t('footer.backToTop')}
        logo={
          <Logo
            src={logoSrcFromLanguage}
            size="medium"
            alt="Helsingin kaupunki"
          />
        }
      >
        <HDS_footer.Link
          aria-label={createAriaLabel(t('footer.privacy'))}
          external
          href={t('profileForm.termsFileDescriptionLink')}
          label={t('footer.privacy')}
          target="_blank"
        />
        <HDS_footer.Link
          href="/accessibility"
          label={t('footer.accessibility')}
        />
        <HDS_footer.Link
          href={config.cookiePagePath}
          label={t('cookies.pageName')}
        />
      </HDS_footer.Base>
    </HDS_footer>
    // <HDSFooter theme="dark" title={t('appName')} logoLanguage={logoLanguage}>
    //   <HDSFooter.Utilities backToTopLabel={t('footer.backToTop')}>
    //     <HDSFooter.Item
    //       href={t('footer.contactUsLink')}
    //       label={t('footer.contactUs')}
    //       aria-label={createAriaLabel(t('footer.contactUs'))}
    //       className={styles['link-with-icon']}
    //       target="_blank"
    //     >
    //       <IconLinkExternal aria-hidden size={'s'} />
    //     </HDSFooter.Item>
    //     <HDSFooter.Item
    //       href={t('footer.feedbackLink')}
    //       label={t('footer.feedback')}
    //       aria-label={createAriaLabel(t('footer.feedback'))}
    //       className={styles['link-with-icon']}
    //       target="_blank"
    //     >
    //       <IconLinkExternal aria-hidden size={'s'} />
    //     </HDSFooter.Item>
    //   </HDSFooter.Utilities>
    //   <HDSFooter.Base
    //     copyrightHolder={t('cityOfHelsinki')}
    //     copyrightText={t('footer.reserveRights')}
    //   >
    //     <HDSFooter.Item
    //       href={t('profileForm.termsFileDescriptionLink')}
    //       label={t('footer.privacy')}
    //       aria-label={createAriaLabel(t('footer.privacy'))}
    //       className={styles['base-link-with-icon']}
    //       target="_blank"
    //     >
    //       <IconLinkExternal aria-hidden size={'xs'} />
    //     </HDSFooter.Item>
    //     <HDSFooter.Item as={Link} to="/accessibility">
    //       {t('footer.accessibility')}
    //     </HDSFooter.Item>
    //     <HDSFooter.Item as={Link} to={config.cookiePagePath}>
    //       {t('cookies.pageName')}
    //     </HDSFooter.Item>
    //   </HDSFooter.Base>
    // </HDSFooter>
  );
}

export default Footer;
