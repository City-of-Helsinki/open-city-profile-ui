import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Button } from 'hds-react';

import Notification from '../../../common/copyOfHDSNotification/Notification';
import PageLayout from '../../../common/pageLayout/PageLayout';
import queryParamsToObject from '../../../common/helpers/queryParamsToObject';
import styles from './ErrorPage.module.css';
import authService from '../../../auth/authService';

export type ErrorPageQueryParams = {
  message?: string;
  title?: string;
  hideLoginButton?: string;
  hideFrontPageLink?: string;
};

export type ErrorPageContent = {
  message?: string;
  title?: string;
  hideLoginButton: boolean;
  hideFrontPageLink: boolean;
};

type ErrorPageProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  content?: ErrorPageContent;
};

function ErrorPage(props?: ErrorPageProps): React.ReactElement {
  const { t } = useTranslation();
  const location = useLocation();

  const getContentFromPropsOrUrl = (
    pageProps?: ErrorPageProps
  ): ErrorPageContent => {
    if (pageProps && pageProps.content) {
      return pageProps.content;
    }
    const contentFromUrl = queryParamsToObject<ErrorPageQueryParams>(
      location.search
    );
    return {
      message: contentFromUrl.message,
      title: contentFromUrl.title,
      hideLoginButton: contentFromUrl.hideLoginButton !== undefined,
      hideFrontPageLink: contentFromUrl.hideFrontPageLink !== undefined,
    };
  };

  const {
    message,
    title,
    hideLoginButton,
    hideFrontPageLink,
  } = getContentFromPropsOrUrl(props);
  const notificationMessage = message || t('notification.defaultErrorText');
  const notificationTitle = title || t('notification.defaultErrorTitle');
  const isAuthenticated = authService.isAuthenticated();

  return (
    <PageLayout title={notificationTitle} data-testid="error-page-layout">
      <div className={styles.wrapper}>
        <Notification
          type={'error'}
          label={notificationTitle}
          dataTestId={'error-page-notification'}
        >
          <p>{notificationMessage}</p>
          {hideFrontPageLink !== true && (
            <p>
              <Link to="/" data-testid={'error-page-frontpage-link'}>
                {t('nav.goToHomePage')}
              </Link>
            </p>
          )}
        </Notification>
        <div className={styles.buttons}>
          {hideLoginButton !== true && !isAuthenticated && (
            <Button
              onClick={() => authService.login()}
              data-testid={'error-page-login-button'}
            >
              {t('login.login')}
            </Button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default ErrorPage;
