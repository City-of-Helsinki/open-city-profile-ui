import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { Button } from 'hds-react';
import classNames from 'classnames';

import HelsinkiLogo from '../../../common/helsinkiLogo/HelsinkiLogo';
import styles from './Login.module.css';
import PageLayout from '../../../common/pageLayout/PageLayout';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import authService from '../../authService';

function Login(): React.ReactElement {
  const { t } = useTranslation();
  const { trackEvent } = useMatomo();

  return (
    <PageLayout title={'login.login'}>
      <div className={styles.wrapper}>
        <div
          className={classNames([
            commonContentStyles['common-content-area'],
            styles.content,
          ])}
        >
          <HelsinkiLogo />
          <h1>{t('login.title')}</h1>
          <h2>{t('login.description')}</h2>
          <Button
            variant="primary"
            className={styles.button}
            onClick={() => {
              trackEvent({ category: 'action', action: 'Log in' });
              authService.login();
            }}
          >
            {t('login.login')}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}

export default Login;
