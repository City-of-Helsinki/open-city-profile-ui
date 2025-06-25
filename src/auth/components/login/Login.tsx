import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { LoginButton } from 'hds-react';

import HelsinkiLogo from '../../../common/helsinkiLogo/HelsinkiLogo';
import styles from './Login.module.css';
import PageLayout from '../../../common/pageLayout/PageLayout';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import FocusableH1 from '../../../common/focusableH1/FocusableH1';

function Login(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;

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
          <LoginButton
            errorText={t('authentication.genericError.message')}
            loggingInText={t('nav.loggingIn')}
            redirectionProps={{ language: lang }}
          >
            {t('login.login')}
          </LoginButton>
        </div>
      </div>
    </PageLayout>
  );
}

export default Login;
