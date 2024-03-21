import React from 'react';
import { useTranslation } from 'react-i18next';
import { Footer as HDSFooter, Logo, logoFiDark, logoSvDark } from 'hds-react';
import { Link } from 'react-router-dom';

import getLanguageCode from '../helpers/getLanguageCode';
import config from '../../config';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const lang = getLanguageCode(i18n.languages[0]);
  const logoSrcFromLanguage = lang === 'sv' ? logoSvDark : logoFiDark;

  const createAriaLabel = (title: string) => {
    const titleWithoutLastDot =
      title.slice(-1) === '.' ? title.substring(0, title.length - 1) : title;
    return t('opensInNewWindow', {
      title: titleWithoutLastDot,
    });
  };

  const logoHref = `https://hel.fi/${lang}`;
  const whiteColor = 'var(--color-white)';

  return (
    <HDSFooter
      theme={{
        '--footer-background': 'var(--color-bus)',
        '--footer-color': whiteColor,
        '--footer-divider-color': whiteColor,
        '--footer-focus-outline-color': whiteColor,
      }}
      title={t('appName')}
    >
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
        logoHref={logoHref}
      >
        <HDSFooter.Link
          aria-label={createAriaLabel(t('footer.privacy'))}
          external
          href={t('profileForm.termsFileDescriptionLink')}
          label={t('footer.privacy')}
          target="_blank"
        />
        <HDSFooter.Link
          as={Link}
          to="/accessibility"
          label={t('footer.accessibility')}
        />
        <HDSFooter.Link
          as={Link}
          to={config.cookiePagePath}
          label={t('cookies.pageName')}
        />
        <HDSFooter.Link as={Link} to="/about" label={t('footer.about')} />
      </HDSFooter.Base>
    </HDSFooter>
  );
};

export default Footer;
