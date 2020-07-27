import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type Props = {
  className?: string;
};

function FooterLinks(props: Props) {
  const { t } = useTranslation();

  return (
    <span className={props.className}>
      {' '}
      <a
        href={t('profileForm.termsFileDescriptionLink')}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('footer.privacy')}
      </a>{' '}
      | <Link to="/accessibility">{t('footer.accessibility')}</Link>
    </span>
  );
}

export default FooterLinks;
