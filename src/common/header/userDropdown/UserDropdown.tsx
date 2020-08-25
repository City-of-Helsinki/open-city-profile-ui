import React from 'react';
import { useSelector } from 'react-redux';
import { useLazyQuery } from '@apollo/react-hooks';
import { useTranslation } from 'react-i18next';
import { loader } from 'graphql.macro';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import PersonIcon from '../../svg/Person.svg';
import { NameQuery } from '../../../graphql/generatedTypes';
import Dropdown from '../../dropdown/Dropdown';
import useAuthenticate from '../../../auth/useAuthenticate';
import { isAuthenticatedSelector } from '../../../auth/redux';
import useToast from '../../../toast/useToast';

const NAME_QUERY = loader('../../../profile/graphql/NameQuery.graphql');

type Props = {};

function UserDropdown(props: Props) {
  const { createToast } = useToast();
  const [nameQuery, { data, loading }] = useLazyQuery<NameQuery>(NAME_QUERY, {
    onError: () => {
      createToast({ type: 'error' });
    },
    fetchPolicy: 'cache-only',
  });
  const { t } = useTranslation();
  const { trackEvent } = useMatomo();
  const [authenticate, logout] = useAuthenticate();

  const isAuthenticated = useSelector(isAuthenticatedSelector);

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
      authenticate();
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
      logout();
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
