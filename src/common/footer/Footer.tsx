import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Footer as HDSFooter,
  IconPhone,
  Logo,
  logoFiDark,
  logoSvDark,
} from 'hds-react';
import { Link } from 'react-router-dom';

import getLanguageCode from '../helpers/getLanguageCode';
import config from '../../config';
import styles from './Footer.module.css';

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
        <HDSFooter.UtilityGroup
          headingLink={
            <HDSFooter.GroupHeading
              label={t('footer.needHelp')}
              className={styles['utility-group-heading']}
              as="h3"
            />
          }
          className={styles['utility-group']}
        >
          <HDSFooter.Link href={'/guide'} label={t('footer.userGuide')} />
          <div>
            <span>{t('footer.helsinkiProfileSupport')}</span>
            <ul className={styles['contacts-list']}>
              <li>{t('footer.openingHours')}</li>
              <li>
                <HDSFooter.Link
                  className={styles['link-with-icon']}
                  href={'tel:0931088800'}
                  label={'09 310 88800'}
                  icon={<IconPhone />}
                />
              </li>
            </ul>
          </div>
        </HDSFooter.UtilityGroup>
        <HDSFooter.UtilityGroup
          headingLink={
            <HDSFooter.GroupHeading
              label={t('footer.otherContactInformation')}
              className={styles['utility-group-heading']}
              as="h3"
            />
          }
          className={styles['utility-group']}
        >
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
        </HDSFooter.UtilityGroup>
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
        <HDSFooter.Link as={Link} to="/guide" label={t('footer.userGuide')} />
      </HDSFooter.Base>
    </HDSFooter>
  );
};

export default Footer;
