import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import styles from './HelsinkiLogo.module.css';
import getLanguageCode from '../helpers/getLanguageCode';

type Props = {
  className?: string;
  isLinkToFrontPage?: boolean;
};
function HelsinkiLogo({ className, isLinkToFrontPage }: Props) {
  const { t, i18n } = useTranslation();

  const lang = getLanguageCode(i18n.languages[0]);
  const logoStyle = lang === 'sv' ? styles.logoSv : styles.logoFi;

  if (isLinkToFrontPage) {
    return (
      <Link
        to="/"
        className={classNames(logoStyle, className)}
        aria-label={t('helsinkiLogo')}
      />
    );
  }

  return (
    <span
      className={classNames(logoStyle, className)}
      aria-label={t('helsinkiLogo')}
    />
  );
}

export default HelsinkiLogo;
