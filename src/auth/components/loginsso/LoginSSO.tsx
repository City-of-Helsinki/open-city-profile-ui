import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOidcClient } from 'hds-react';

import pageLayoutStyles from '../../../common/pageLayout/PageLayout.module.css';
import Loading from '../../../common/loading/Loading';

function LoginSSO(): React.ReactElement {
  const { t } = useTranslation();
  const { login } = useOidcClient();
  login();
  return (
    <div className={pageLayoutStyles.wrapper}>
      <main className={pageLayoutStyles.content}>
        <Loading isLoading loadingText={t('oidc.authenticating')} />
      </main>
    </div>
  );
}

export default LoginSSO;
