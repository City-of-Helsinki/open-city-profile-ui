import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router';
import { Button } from 'hds-react';

import Notification from '../../../common/copyOfHDSNotification/Notification';
import PageLayout from '../../../common/pageLayout/PageLayout';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import queryParamsToObject from '../../../common/helpers/queryParamsToObject';
import styles from './ErrorPage.module.css';
import authService from '../../../auth/authService';

type QueryParams = {
  message?: string;
  title?: string;
  hideLogin?: string;
  hideHomePageLink?: string;
};

function ErrorPage(): React.ReactElement {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { message, title, hideLogin, hideHomePageLink } = queryParamsToObject<
    QueryParams
  >(location.search);
  const notificationMessage = message || t('notification.defaultErrorText');
  const notificationTitle = title || t('notification.defaultErrorTitle');
  const isAuthenticated = authService.isAuthenticated();

  return (
    <PageLayout title={title} data-testid="error-page-layout">
      <div className={responsive['max-width-centered']}>
        <div className={styles.wrapper}>
          <Notification type={'error'} label={notificationTitle}>
            {notificationMessage}
          </Notification>
          <div className={styles.buttons}>
            {hideLogin === undefined && !isAuthenticated && (
              <Button onClick={() => authService.login()}>
                {t('login.login')}
              </Button>
            )}
            {hideHomePageLink === undefined && (
              <Button onClick={() => history.push('/')}>
                {t('nav.titleAriaLabel')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default ErrorPage;
