import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Button, Notification, User } from 'hds-react';

import PageLayout from '../../../common/pageLayout/PageLayout';
import CreateProfile from '../createProfile/CreateProfile';
import ViewProfile from '../viewProfile/ViewProfile';
import Loading from '../../../common/loading/Loading';
import styles from './Profile.module.css';
import useAuth from '../../../auth/useAuth';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import { useProfileLoadTracker } from '../../hooks/useProfileLoadTracker';
// import { WithAuthCheckChildProps } from '../withAuthCheck/WithAuthCheck';

function Profile(): React.ReactElement {
  const { t } = useTranslation();
  const location = useLocation();
  const {
    hasExistingProfile,
    isProfileLoadComplete,
    didProfileLoadFail,
    reloadProfile,
  } = useProfileLoadTracker();

  const { logout } = useAuth();

  const getPageTitle = () => {
    const pathname = location.pathname.substring(1);

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
                  onClick={() => logout()}
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
        {/*
        <CreateProfile
          tunnistamoUser={props.user}
          onProfileCreated={() => reloadProfile()}
        /> // */}
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
