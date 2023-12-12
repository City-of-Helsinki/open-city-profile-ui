import React from 'react';
import { useTranslation } from 'react-i18next';
import { Footer as HDSFooter, Logo, logoFiDark, logoSvDark } from 'hds-react';

import getLanguageCode from '../helpers/getLanguageCode';
import config from '../../config';

const Footer = () => {
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
    <HDSFooter theme="dark" title={t('appName')}>
      <HDSFooter.Utilities>
        <HDSFooter.Link
          aria-label={createAriaLabel(t('footer.contactUs'))}
          external
          href={t('footer.contactUsLink')}
          label={t('footer.contactUs')}
          target="_blank"
        />
        <HDSFooter.Link
          aria-label={createAriaLabel(t('footer.feedback'))}
          external
          href={t('footer.feedbackLink')}
          label={t('footer.feedback')}
          target="_blank"
        />
      </HDSFooter.Utilities>
      <HDSFooter.Base
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
        <HDSFooter.Link
          aria-label={createAriaLabel(t('footer.privacy'))}
          external
          href={t('profileForm.termsFileDescriptionLink')}
          label={t('footer.privacy')}
          target="_blank"
        />
        <HDSFooter.Link
          href="/accessibility"
          label={t('footer.accessibility')}
        />
        <HDSFooter.Link
          href={config.cookiePagePath}
          label={t('cookies.pageName')}
        />
      </HDSFooter.Base>
    </HDSFooter>
  );
};

export default Footer;
