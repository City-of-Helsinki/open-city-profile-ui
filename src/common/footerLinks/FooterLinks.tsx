import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import tosConstants from '../../tos/constants/tosConstants';

type Props = {
  className?: string;
};

function FooterLinks(props: Props) {
  const { t, i18n } = useTranslation();
  const selectedLanguage =
    (i18n.languages && i18n.languages[0].toUpperCase()) || 'FI';
  const link = Object(tosConstants.REGISTER_DESCRIPTION)[selectedLanguage];
  return (
    <span className={props.className}>
      {' '}
      <a href={link}>{t('footer.privacy')}</a> |{' '}
      <Link to="/#">{t('footer.accessibility')}</Link> |{' '}
      <Link to="/terms-of-service">{t('footer.terms')}</Link>
    </span>
  );
}

export default FooterLinks;
