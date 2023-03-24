import { User } from 'oidc-client-ts';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import authService from '../../../auth/authService';
import Loading from '../../../common/loading/Loading';
import PageLayout from '../../../common/pageLayout/PageLayout';
import { getLinkRedirectState } from '../../hooks/useHistoryListener';

export type WithAuthCheckChildProps = { user: User };

const WithAuthCheck = ({
  AuthenticatedComponent,
}: {
  AuthenticatedComponent: React.FC<WithAuthCheckChildProps>;
}): React.ReactElement => {
  const { t } = useTranslation();
  const history = useHistory();
  const [user, setUser] = useState<User | null>(null);

  useMemo(() => {
    authService
      .getAuthenticatedUser()
      .then(authenticatedUser => {
        setUser(authenticatedUser);
      })
      .catch(() => {
        history.push('/login', getLinkRedirectState());
      });
  }, [history]);
  if (!user) {
    return (
      <PageLayout title={t('appName')} disableFocusing>
        <Loading isLoading loadingText={t('loading')} />
      </PageLayout>
    );
  }
  return <AuthenticatedComponent user={user} />;
};

export default WithAuthCheck;
