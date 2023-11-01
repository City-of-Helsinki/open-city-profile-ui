import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import classNames from 'classnames';
import { Logo, logoFi, logoSv } from 'hds-react';

import styles from './Login.module.css';
import PageLayout from '../../../common/pageLayout/PageLayout';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import authService from '../../authService';
import FocusableH1 from '../../../common/focusableH1/FocusableH1';
import StyledButton from '../../../common/styledButton/StyledButton';

function Login(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const { trackEvent } = useMatomo();

  const lang = i18n.resolvedLanguage;
  const logoSrcFromLanguage = lang === 'sv' ? logoSv : logoFi;

  return (
    <PageLayout title={'login.login'}>
      <div className={styles.wrapper}>
        <div
          className={classNames([
            commonContentStyles['common-content-area'],
            styles.content,
          ])}
        >
          <Logo
            src={logoSrcFromLanguage}
            size="large"
            alt={t('helsinkiLogo')}
          />
          <FocusableH1>{t('login.title')}</FocusableH1>
          <p className={styles.ingress}>{t('login.description')}</p>
          <StyledButton
            variant="primary"
            className={styles.button}
            onClick={() => {
              trackEvent({ category: 'action', action: 'Log in' });
              authService.login();
            }}
          >
            {t('login.login')}
          </StyledButton>
        </div>
      </div>
    </PageLayout>
  );
}

export default Login;
