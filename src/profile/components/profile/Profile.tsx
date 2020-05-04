import React, { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router';
import { loader } from 'graphql.macro';
import { User } from 'oidc-client';
import * as Sentry from '@sentry/browser';

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
  const location = useLocation();

  const [checkProfileExists, { data, loading }] = useLazyQuery<
    ProfileExistsQuery
  >(PROFILE_EXISTS, {
    fetchPolicy: 'no-cache',
    onError: (error: Error) => {
      Sentry.captureException(error);
      setShowNotification(true);
    },
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

  const getPageTitle = () => {
    const pathname = location.pathname.substr(1);

    if (!isLoadingAnything && pathname.length === 0) {
      return isProfileFound ? 'nav.information' : 'profileForm.pageTitle';
    }

    switch (pathname) {
      case 'connected-services':
        return 'serviceConnections.title';
      case 'subscriptions':
        return 'subscriptions.title';
      default:
        return 'appName';
    }
  };

  return (
    <PageLayout title={getPageTitle()}>
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
