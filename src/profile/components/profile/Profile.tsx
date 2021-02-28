import React, { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router';
import { loader } from 'graphql.macro';
import { User } from 'oidc-client';
import * as Sentry from '@sentry/browser';
import { ApolloError } from 'apollo-boost';
import { Notification } from 'hds-react';

import PageLayout from '../../../common/pageLayout/PageLayout';
import CreateProfile from '../createProfile/CreateProfile';
import ViewProfile from '../viewProfile/ViewProfile';
import Loading from '../../../common/loading/Loading';
import styles from './Profile.module.css';
import { ProfileExistsQuery } from '../../../graphql/generatedTypes';
import authService from '../../../auth/authService';
import responsive from '../../../common/cssHelpers/responsive.module.css';

const PROFILE_EXISTS = loader('../../graphql/ProfileExistsQuery.graphql');

function Profile(): React.ReactElement {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();

  const [checkProfileExists, { data, loading, error }] = useLazyQuery<
    ProfileExistsQuery
  >(PROFILE_EXISTS, {
    fetchPolicy: 'no-cache',
    onError: (apolloError: ApolloError) => {
      Sentry.captureException(apolloError);
    },
  });
  const [isCheckingAuthState, setIsCheckingAuthState] = useState(true);
  const [tunnistamoUser, setTunnistamoUser] = useState<User>();

  useEffect(() => {
    authService
      .getUser()
      .then(user => {
        if (!user) {
          return history.push('/login');
        }

        checkProfileExists();
        setTunnistamoUser(user);
        setIsCheckingAuthState(false);
        return undefined;
      })
      .catch(() => history.push('/login'));
  }, [checkProfileExists, history]);

  const isLoadingAnything = Boolean(isCheckingAuthState || loading);
  const isProfileFound = data && data.myProfile;
  const hasGraphQLError = error && error.graphQLErrors.length;

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

  if (!isProfileFound && tunnistamoUser && hasGraphQLError) {
    return (
      <PageLayout title={getPageTitle()}>
        <div className={styles.errorWrapper}>
          <div className={responsive.maxWidthCentered}>
            <Notification
              type={'error'}
              label={t('notification.defaultErrorTitle')}
            >
              {t('notification.defaultErrorText')}
            </Notification>
          </div>
        </div>
      </PageLayout>
    );
  }

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
          tunnistamoUser && (
            <CreateProfile
              tunnistamoUser={tunnistamoUser}
              onProfileCreated={() => checkProfileExists()}
            />
          )
        )}
      </Loading>
    </PageLayout>
  );
}

export default Profile;
