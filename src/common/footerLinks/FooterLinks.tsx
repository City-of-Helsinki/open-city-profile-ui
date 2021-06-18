import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import NewWindowLink from '../newWindowLink/NewWindowLink';

type Props = {
  className?: string;
};

function FooterLinks(props: Props): React.ReactElement {
  const { t } = useTranslation();

  return (
    <span className={props.className}>
      {' '}
      <NewWindowLink
        link={t('profileForm.termsFileDescriptionLink')}
        title={t('footer.privacy')}
      />{' '}
      | <Link to="/accessibility">{t('footer.accessibility')}</Link>
    </span>
  );
}

export default FooterLinks;
