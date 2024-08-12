import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Button } from 'hds-react';

import HelsinkiLogo from '../../../common/helsinkiLogo/HelsinkiLogo';
import styles from './Login.module.css';
import PageLayout from '../../../common/pageLayout/PageLayout';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import authService from '../../authService';
import FocusableH1 from '../../../common/focusableH1/FocusableH1';
import useMatomo from '../../../common/matomo/hooks/useMatomo';

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
          <FocusableH1>{t('login.title')}</FocusableH1>
          <p className={styles.ingress}>{t('login.description')}</p>

          <Button
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
