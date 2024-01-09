import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Header as HDSHeader, IconUser } from 'hds-react';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import authService from '../../../auth/authService';
import { ProfileContext } from '../../../profile/context/ProfileContext';

type UserDataWithActions = {
  userName: string;
  label: string;
  ariaLabel: string;
  onClick: (e?: React.MouseEvent) => Promise<void>;
};

const UserDropdown = () => {
  const { t } = useTranslation();
  const { trackEvent } = useMatomo();
  const { getName } = useContext(ProfileContext);

  const isAuthenticated = authService.isAuthenticated();

  const getUserDataWithActions = (): UserDataWithActions => {
    // eslint-disable-next-line no-shadow
    const name = getName(true);

    const logoutAction = (e?: React.MouseEvent): Promise<void> => {
      e?.preventDefault();
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
      : `${t('landmarks.navigation.user')}: ${name}`;

    if (!isAuthenticated) {
      return {
        userName: name,
        onClick: loginAction,
        label: loginLabel,
        ariaLabel,
      };
    }

    return {
      userName: name,
      onClick: logoutAction,
      label: logoutLabel,
      ariaLabel,
    };
  };
  const { label, onClick } = getUserDataWithActions();
  return (
    <HDSHeader.ActionBarItem
      label={label}
      ariaLabel={t('nav.menuButtonLabel')}
      id="header-user-dropdown"
      fixedRightPosition
      icon={<IconUser />}
      closeLabel={t('nav.close')}
      preventButtonResize
    >
      <HDSHeader.Link
        label={label}
        onClick={(e: React.MouseEvent) => onClick(e)}
      />
    </HDSHeader.ActionBarItem>
  );
};

export default UserDropdown;
