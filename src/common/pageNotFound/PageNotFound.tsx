import React from 'react';
import { useTranslation } from 'react-i18next';

import ErrorPage from '../../profile/components/errorPage/ErrorPage';

function PageNotFound(): React.ReactElement {
  const { t } = useTranslation();

  const content = {
    title: t('pageNotFoundTitle'),
    message: t('pageNotFoundText'),
    hideLoginButton: true,
    hideFrontPageLink: false,
  };
  return <ErrorPage content={content} />;
}

export default PageNotFound;
