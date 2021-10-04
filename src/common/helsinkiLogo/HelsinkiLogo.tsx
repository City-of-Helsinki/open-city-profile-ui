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
function HelsinkiLogo({
  className,
  isLinkToFrontPage,
}: Props): React.ReactElement {
  const { t, i18n } = useTranslation();

  const lang = getLanguageCode(i18n.languages[0]);
  const logoStyle = lang === 'sv' ? styles['logo-sv'] : styles['logo-fi'];

  const logoClassName = classNames(styles['logo'], logoStyle, className);
  const titleAndAriaLabel = t('nav.titleAriaLabel');

  if (isLinkToFrontPage) {
    return <Link to="/" className={logoClassName} title={titleAndAriaLabel} />;
  }

  return <span className={logoClassName} aria-label={titleAndAriaLabel} />;
}

export default HelsinkiLogo;
