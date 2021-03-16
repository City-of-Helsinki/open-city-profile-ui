import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconSignout, Navigation } from 'hds-react';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { loader } from 'graphql.macro';
import { useLazyQuery } from '@apollo/client';

import { NameQuery } from '../../../graphql/generatedTypes';
import authService from '../../../auth/authService';
import useToast from '../../../toast/useToast';

type UserDataWithActions = {
  userName: string;
  label: string;
  ariaLabel: string;
  onClick: () => Promise<void>;
};

const NAME_QUERY = loader('../../../profile/graphql/NameQuery.graphql');

function UserDropdown(): React.ReactElement {
  const { t } = useTranslation();
  const { trackEvent } = useMatomo();
  const { createToast } = useToast();

  const isAuthenticated = authService.isAuthenticated();
  const [nameQuery, { data, loading }] = useLazyQuery<NameQuery>(NAME_QUERY, {
    onError: () => {
      createToast({ type: 'error' });
    },
    fetchPolicy: 'cache-only',
  });

  React.useEffect(() => {
    if (isAuthenticated) {
      nameQuery();
    }
  }, [isAuthenticated, nameQuery]);

  const getUserDataWithActions = (): UserDataWithActions => {
    const userLoaded = isAuthenticated && !loading && data?.myProfile;
    // eslint-disable-next-line no-shadow
    const userName = userLoaded
      ? `${data?.myProfile?.firstName} ${data?.myProfile?.lastName}`
      : '';

    const logoutAction = (): Promise<void> => {
      trackEvent({ category: 'action', action: 'Log out' });
      return authService.logout();
    };
    const loginAction = (): Promise<void> => {
      trackEvent({ category: 'action', action: 'Log in' });
      return authService.login();
    };

    const loginLabel = t('nav.signin');
    const logoutLabel = t('nav.signout');
    const ariaLabel = !isAuthenticated
      ? loginLabel
      : `${t('landmarks.navigation.user')}: ${userName}`;

    if (!isAuthenticated) {
      return {
        userName,
        onClick: loginAction,
        label: loginLabel,
        ariaLabel,
      };
    }

    return {
      userName,
      onClick: logoutAction,
      label: logoutLabel,
      ariaLabel,
    };
  };
  const { label, userName, onClick } = getUserDataWithActions();
  return (
    <Navigation.User
      authenticated={isAuthenticated}
      label={label}
      onSignIn={(): Promise<void> => authService.login()}
      userName={userName}
      buttonAriaLabel={label}
    >
      <Navigation.Item
        label={userName}
        href="/"
        target="_blank"
        variant="primary"
      />
      <Navigation.Item
        onClick={(): Promise<void> => onClick()}
        variant="secondary"
        label={label}
        icon={<IconSignout aria-hidden />}
      />
    </Navigation.User>
  );
}

export default UserDropdown;
