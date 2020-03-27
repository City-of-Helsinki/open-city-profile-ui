import React, { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { loader } from 'graphql.macro';
import { User } from 'oidc-client';

import getAuthenticatedUser from '../../../auth/getAuthenticatedUser';
import PageLayout from '../../../common/pageLayout/PageLayout';
import CreateProfile from '../createProfile/CreateProfile';
import ViewProfile from '../viewProfile/ViewProfile';
import Loading from '../../../common/loading/Loading';
import styles from './Profile.module.css';
import { ProfileExistsQuery } from '../../../graphql/generatedTypes';
import NotificationComponent from '../../../common/notification/NotificationComponent';

const PROFILE_EXISTS = loader('../../graphql/ProfileExistsQuery.graphql');

type Props = {};

function Profile(props: Props) {
  const { t } = useTranslation();
  const history = useHistory();
  const [checkProfileExists, { data, loading }] = useLazyQuery<
    ProfileExistsQuery
  >(PROFILE_EXISTS, {
    fetchPolicy: 'no-cache',
    onError: () => setShowNotification(true),
  });
  const [isCheckingAuthState, setIsCheckingAuthState] = useState(true);
  const [tunnistamoUser, setTunnistamoUser] = useState<User>();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    getAuthenticatedUser()
      .then(user => {
        checkProfileExists();
        setTunnistamoUser(user);
        setIsCheckingAuthState(false);
      })
      .catch(() => history.push('/login'));
  }, [checkProfileExists, history]);

  const isLoadingAnything = Boolean(isCheckingAuthState || loading);
  const isProfileFound = data && data.myProfile;

  return (
    <PageLayout>
      <Loading
        loadingClassName={styles.loading}
        isLoading={isLoadingAnything}
        loadingText={t('profile.loading')}
      >
        {isProfileFound ? (
          <ViewProfile />
        ) : (
          <CreateProfile
            tunnistamoUser={tunnistamoUser as User}
            onProfileCreated={() => checkProfileExists()}
          />
        )}
      </Loading>

      <NotificationComponent
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </PageLayout>
  );
}

export default Profile;
