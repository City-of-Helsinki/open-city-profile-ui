import React from 'react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import * as Sentry from '@sentry/browser';
import { Button, Notification } from 'hds-react';

import PageLayout from '../../../common/pageLayout/PageLayout';
import CreateProfile from '../createProfile/CreateProfile';
import ViewProfile from '../viewProfile/ViewProfile';
import Loading from '../../../common/loading/Loading';
import styles from './Profile.module.css';
import authService from '../../../auth/authService';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import { useProfileErrorListener } from '../../context/ProfileContext';
import parseGraphQLError from '../../helpers/parseGraphQLError';
import useToast from '../../../toast/useToast';
import { useProfileLoadTracker } from '../../hooks/useProfileLoadTracker';
import { WithAuthCheckChildProps } from '../withAuthCheck/WithAuthCheck';

function Profile(props: WithAuthCheckChildProps): React.ReactElement {
  const { t } = useTranslation();
  const location = useLocation();
  const { createToast } = useToast();
  const {
    hasExistingProfile,
    isProfileLoadComplete,
    didProfileLoadFail,
    reloadProfile,
  } = useProfileLoadTracker();

  useProfileErrorListener((apolloError: ApolloError | Error) => {
    if (parseGraphQLError(apolloError).isAllowedError) {
      return;
    }
    Sentry.captureException(apolloError);
    createToast({ type: 'error' });
  });

  const getPageTitle = () => {
    const pathname = location.pathname.substr(1);

    if (isProfileLoadComplete() && pathname.length === 0) {
      return hasExistingProfile()
        ? 'nav.information'
        : 'createProfile.pageTitle';
    }

    switch (pathname) {
      case 'connected-services':
        return 'nav.services';
      default:
        return 'appName';
    }
  };

  if (isProfileLoadComplete()) {
    if (didProfileLoadFail()) {
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
                  onClick={() => reloadProfile()}
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
    if (hasExistingProfile()) {
      return (
        <PageLayout title={getPageTitle()}>
          <ViewProfile />
        </PageLayout>
      );
    }
    return (
      <PageLayout title={getPageTitle()}>
        <CreateProfile
          tunnistamoUser={props.user}
          onProfileCreated={() => reloadProfile()}
        />
        ;
      </PageLayout>
    );
  }

  return (
    <PageLayout title={getPageTitle()} disableFocusing>
      <Loading isLoading loadingText={t('profile.loading')} />
    </PageLayout>
  );
}
export default Profile;
