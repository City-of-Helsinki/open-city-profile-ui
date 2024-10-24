import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { LoginButton, Notification } from 'hds-react';
import classNames from 'classnames';

import PageLayout from '../../../common/pageLayout/PageLayout';
import queryParamsToObject from '../../../common/helpers/queryParamsToObject';
import styles from './ErrorPage.module.css';
import useAuth from '../../../auth/useAuth';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';

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
  const { isAuthenticated } = useAuth();

  return (
    <PageLayout
      title={notificationTitle}
      data-testid="error-page-layout"
      focusElementSelector={
        '*[data-testid="error-page-notification"] *[role="heading"]'
      }
    >
      <div
        className={classNames([
          commonContentStyles['common-content-area'],
          commonContentStyles['common-vertical-padding'],
          styles.wrapper,
        ])}
      >
        <Notification
          type={'error'}
          label={notificationTitle}
          data-testid={'error-page-notification'}
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
            <LoginButton
              data-testid={'error-page-login-button'}
              errorText={t('authentication.genericError.message')}
              loggingInText="Logging in"
            >
              {t('login.login')}
            </LoginButton>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default ErrorPage;
