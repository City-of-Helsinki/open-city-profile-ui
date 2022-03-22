import React, { useContext, useEffect, useState } from 'react';
import { useLazyQuery, ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router';
import { loader } from 'graphql.macro';
import { User } from 'oidc-client';
import * as Sentry from '@sentry/browser';
import { Button, Notification } from 'hds-react';

import PageLayout from '../../../common/pageLayout/PageLayout';
import CreateProfile from '../createProfile/CreateProfile';
import ViewProfile from '../viewProfile/ViewProfile';
import Loading from '../../../common/loading/Loading';
import styles from './Profile.module.css';
import { ProfileExistsQuery as ProfileExistsRoot } from '../../../graphql/generatedTypes';
import authService from '../../../auth/authService';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import {
  ProfileContext,
  useProfileErrorListener,
} from '../../context/ProfileContext';
import parseGraphQLError from '../../helpers/parseGraphQLError';
import useToast from '../../../toast/useToast';
import { getLinkRedirectState } from '../../hooks/useHistoryListener';

const PROFILE_EXISTS = loader('../../graphql/ProfileExistsQuery.graphql');

function Profile(): React.ReactElement {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { createToast } = useToast();

  const [checkProfileExists, { data, loading, error }] = useLazyQuery<
    ProfileExistsRoot
  >(PROFILE_EXISTS, {
    fetchPolicy: 'no-cache',
    onError: (apolloError: ApolloError) => {
      Sentry.captureException(apolloError);
    },
  });
  const {
    fetch: fetchProfile,
    isInitialized: isProfileInitialized,
    isComplete: isProfileComplete,
  } = useContext(ProfileContext);
  const [isCheckingAuthState, setIsCheckingAuthState] = useState(true);
  const [tunnistamoUser, setTunnistamoUser] = useState<User>();
  useProfileErrorListener((apolloError: ApolloError | Error) => {
    if (parseGraphQLError(apolloError).isAllowedError) {
      return;
    }
    Sentry.captureException(apolloError);
    createToast({ type: 'error' });
  });

  useEffect(() => {
    authService
      .getAuthenticatedUser()
      .then(user => {
        checkProfileExists();
        setTunnistamoUser(user as User);
        setIsCheckingAuthState(false);
        return undefined;
      })
      .catch(() => history.push('/login', getLinkRedirectState()));
  }, [checkProfileExists, history]);

  const isDoingProfileChecks = isCheckingAuthState || loading;
  const isProfileFound = !!(data && data.myProfile);
  const failedToFetchUserProfileData =
    tunnistamoUser && !isProfileFound && !!error;

  useEffect(() => {
    if (isProfileFound && !isProfileInitialized) {
      fetchProfile();
    }
  }, [fetchProfile, isProfileFound, isProfileInitialized]);

  const isLoadingProfile = isProfileFound && !isProfileComplete;

  const getPageTitle = () => {
    const pathname = location.pathname.substr(1);

    if (!isDoingProfileChecks && pathname.length === 0) {
      return isProfileFound ? 'nav.information' : 'createProfile.pageTitle';
    }

    switch (pathname) {
      case 'connected-services':
        return 'nav.services';
      default:
        return 'appName';
    }
  };
  if (failedToFetchUserProfileData) {
    return (
      <PageLayout title={'notification.defaultErrorTitle'}>
        <div
          className={styles['error-wrapper']}
          data-testid="profile-check-error-layout"
        >
          <div className={responsive['max-width-centered']}>
            <Notification
              type={'error'}
              label={t('notification.defaultErrorTitle')}
            >
              {t('profile.loadErrorText')}
            </Notification>
            <div className={styles['error-button-wrapper']}>
              <Button
                onClick={() => checkProfileExists()}
                data-testid={'profile-check-error-reload-button'}
              >
                {t('profile.reload')}
              </Button>
              <Button
                onClick={() => authService.logout()}
                data-testid={'profile-check-error-logout-button'}
                variant={'secondary'}
              >
                {t('nav.signout')}
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={getPageTitle()}>
      <Loading
        isLoading={isDoingProfileChecks || isLoadingProfile}
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
