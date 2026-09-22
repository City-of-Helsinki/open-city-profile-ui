import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import pageLayoutStyles from '../../../common/pageLayout/PageLayout.module.css';
import useAuth from '../../useAuth';
import Loading from '../../../common/loading/Loading';

function LoginSSO(): React.ReactElement {
  const { t } = useTranslation();

  const { login } = useAuth();

  useEffect(() => {
    login().catch(() => {
      // Navigation errors (e.g. blocked by iOS WebKit without a user gesture)
      // are silently caught here to prevent unhandled exceptions.
    });
  }, [login]);

  return (
    <div className={pageLayoutStyles.wrapper}>
      <main className={pageLayoutStyles.content}>
        <Loading isLoading loadingText={t('oidc.authenticating')} />
      </main>
    </div>
  );
}

export default LoginSSO;
