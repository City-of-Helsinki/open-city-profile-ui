import classNames from 'classnames';
import { Notification } from 'hds-react';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import commonContentStyles from '../../common/cssHelpers/content.module.css';
import PageLayout from '../../common/pageLayout/PageLayout';
import { ConsentController } from '../cookieConsentController';
import styles from './CookieConsent.module.css';
import { CookieConsentContext } from './CookieConsentContext';
import CookieDetails from './CookieDetails';
import CookieConsentButtons from './CookieConsentButtons';

function CookieConsentPage(): React.ReactElement | null {
  const cookieConsentContext = useContext(CookieConsentContext);

  const { t } = useTranslation();

  const [, forceUpdate] = useState<number>(0);

  const [showSaveNotification, setShowSaveNotification] = useState<boolean>(
    false
  );

  const reRender = () => {
    forceUpdate(p => p + 1);
  };

  const save = (): void => {
    cookieConsentContext.save();
    if (cookieConsentContext.hasUserHandledAllConsents()) {
      setShowSaveNotification(true);
    }
  };

  const approveRequired: ConsentController['approveRequired'] = () => {
    cookieConsentContext.approveRequired();
    save();
    reRender();
  };

  const onChange: ConsentController['update'] = (key, value) => {
    cookieConsentContext.update(key, value);
    reRender();
  };

  return (
    <PageLayout title={'cookies.cookieSettings'}>
      <div
        className={classNames([
          commonContentStyles['common-content-area'],
          commonContentStyles['common-bottom-padding'],
          styles['settings-page-content'],
        ])}
        data-testid="cookie-consent-settings"
      >
        <div className={styles.content}>
          <div className={styles['text-content']}>
            <h1>{t('cookies.cookieSettings')}</h1>
            <p id="cookie-consent-description">
              {t('cookies.informationText')}
            </p>
          </div>

          <CookieDetails
            requiredConsents={cookieConsentContext.getRequired()}
            optionalConsents={cookieConsentContext.getOptional()}
            onChange={onChange}
            isOnSettingsPage
          />
          <CookieConsentButtons
            onApproveRequired={() => {
              approveRequired();
            }}
            onApproveSelectionsAndRequired={() => {
              approveRequired();
            }}
          />
          {showSaveNotification && (
            <Notification
              type={'success'}
              label={t('cookies.consentSettingsSaved')}
              className={styles['notification']}
            />
          )}
          <Link to="/" className={styles['frontpage-button']}>
            {t('nav.goToHomePage')}
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}

export default CookieConsentPage;
