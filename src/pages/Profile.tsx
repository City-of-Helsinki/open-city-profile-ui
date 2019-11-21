import React, { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import PageLayout from '../common/layout/PageLayout';
import PROFILE_EXISTS from '../profile/profileExistsQuery';
import CreateProfile from '../profile/CreateProfile';
import getAuthenticatedUser from '../auth/getAuthenticatedUser';

type Props = {};

function Profile(props: Props) {
  const { t } = useTranslation();
  const history = useHistory();
  const [checkProfileExists, { data, loading }] = useLazyQuery(PROFILE_EXISTS);
  const [isCheckingAuthState, setIsCheckingAuthState] = useState(true);
  const [tunnistamoUser, setTunnistamoUser] = useState();

  useEffect(() => {
    getAuthenticatedUser()
      .then(user => {
        checkProfileExists();
        setTunnistamoUser(user);
        setIsCheckingAuthState(false);
      })
      .catch(() => history.push('/'));
  }, [checkProfileExists, history]);

  const isLoadingAnything = Boolean(isCheckingAuthState || loading);
  const isProfileFound = data && data.myProfile;

  return (
    <PageLayout>
      {isLoadingAnything ? (
        <span>{t('profile.loading')}</span>
      ) : isProfileFound ? (
        JSON.stringify(data.myProfile)
      ) : (
        <CreateProfile tunnistamoUser={tunnistamoUser} />
      )}
    </PageLayout>
  );
}

export default Profile;
