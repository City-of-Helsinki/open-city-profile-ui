import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

function AppMeta() {
  const { i18n } = useTranslation();

  return (
    <Helmet>
      <html lang={i18n.language} />
    </Helmet>
  );
}

export default AppMeta;
