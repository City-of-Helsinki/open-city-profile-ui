import React from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { useTranslation } from 'react-i18next';
import { loader } from 'graphql.macro';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import PersonIcon from '../../svg/Person.svg';
import { NameQuery } from '../../../graphql/generatedTypes';
import Dropdown from '../../dropdown/Dropdown';
import authService from '../../../auth/authService';
import useToast from '../../../toast/useToast';

const NAME_QUERY = loader('../../../profile/graphql/NameQuery.graphql');

type Props = Record<string, unknown>;

function UserDropdown(props: Props): React.ReactElement {
  const { createToast } = useToast();
  const [nameQuery, { data, loading }] = useLazyQuery<NameQuery>(NAME_QUERY, {
    onError: () => {
      createToast({ type: 'error' });
    },
    fetchPolicy: 'cache-only',
  });
  const { t } = useTranslation();
  const { trackEvent } = useMatomo();

  const isAuthenticated = authService.isAuthenticated();

  React.useEffect(() => {
    if (isAuthenticated) {
      nameQuery();
    }
  }, [isAuthenticated, nameQuery]);

  const getDropdownOptions = () => {
    if (loading) return [login];

    // Shows logout in registration form
    if (isAuthenticated && !loading && !data?.myProfile) {
      return [logOut];
    }

    // Shows login
    if (!isAuthenticated && !loading && !data?.myProfile) {
      return [login];
    }

    return [user, logOut];
  };

  const login = {
    id: 'loginButton',
    label: t('nav.signin'),
    onClick: () => {
      trackEvent({ category: 'action', action: 'Log in' });
      authService.login();
    },
  };

  const user = {
    id: 'userButton',
    icon: PersonIcon,
    altText: t('nav.menuButtonLabel'),
    label: !loading
      ? `${data?.myProfile?.firstName} ${data?.myProfile?.lastName}`
      : '',
  };

  const logOut = {
    id: 'logoutButton',
    label: t('nav.signout'),
    onClick: () => {
      trackEvent({ category: 'action', action: 'Log out' });
      authService.logout();
    },
  };

  const dropdownOptions = getDropdownOptions();

  return (
    <React.Fragment>
      <Dropdown options={dropdownOptions} />
    </React.Fragment>
  );
}

export default UserDropdown;
