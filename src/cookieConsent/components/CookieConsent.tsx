import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Card, IconAngleUp, IconAngleDown, useAccordion } from 'hds-react';

import styles from './CookieConsent.module.css';
import CookieDetails from './CookieDetails';
import { ConsentController } from '../cookieConsentController';
import CookieMainInformation from './CookieMainInformation';
import CookieConsentButtons from './CookieConsentButtons';
import LanguageSwitcher from '../../i18n/components/languageSwitcher/LanguageSwitcher';
import FocusKeeper from '../../common/focusKeeper/FocusKeeper';
import { CookieConsentContext } from './CookieConsentContext';
import commonFormStyles from '../../common/cssHelpers/form.module.css';

function CookieConsent(): React.ReactElement | null {
  const cookieConsentContext = useContext(CookieConsentContext);

  const { t } = useTranslation();

  const [, forceUpdate] = useState<number>(0);

  const { isOpen, buttonProps, contentProps } = useAccordion({
    initiallyOpen: false,
  });
  const Icon = isOpen ? IconAngleUp : IconAngleDown;

  const settingsButtonText = isOpen
    ? t('cookies.hideSettings')
    : t('cookies.showSettings');

  const [
    showScreenReaderSaveNotification,
    setShowScreenReaderSaveNotification,
  ] = useState<boolean>(false);

  const [popupTimerComplete, setPopupTimerComplete] = useState<boolean>(false);

  const reRender = () => {
    forceUpdate(p => p + 1);
  };

  const save = (): void => {
    cookieConsentContext.save();
    if (cookieConsentContext.hasUserHandledAllConsents()) {
      setShowScreenReaderSaveNotification(true);
    }
  };

  const approveRequired: ConsentController['approveRequired'] = () => {
    cookieConsentContext.approveRequired();
    save();
    reRender();
  };

  const approveAll: ConsentController['approveAll'] = () => {
    cookieConsentContext.approveAll();
    save();
    reRender();
  };

  const onChange: ConsentController['update'] = (key, value) => {
    cookieConsentContext.update(key, value);
    reRender();
  };

  const popupDelayInMs = 500;
  useEffect(() => {
    setTimeout(() => setPopupTimerComplete(true), popupDelayInMs);
  }, []);

  if (showScreenReaderSaveNotification) {
    return (
      <div
        role="alert"
        className={commonFormStyles['visually-hidden']}
        data-testid={'cookie-consent-screen-reader-notification'}
        tabIndex={-1}
      >
        {t('cookies.consentSettingsSaved')}
      </div>
    );
  }

  if (!cookieConsentContext.willRenderCookieConsentDialog) {
    return null;
  }

  return (
    <div
      className={classNames([
        styles.container,
        popupTimerComplete && styles['animate-in'],
      ])}
      data-testid="cookie-consent"
    >
      <div className={styles.aligner}>
        <FocusKeeper
          targetId={'cookie-consent-active-heading'}
          className={styles['content-spacing-and-border']}
        >
          <div
            className={styles.content}
            role="dialog"
            aria-labelledby="cookie-consent-active-heading"
            aria-describedby="cookie-consent-description"
            id="cookie-consent-content"
            aria-live="assertive"
          >
            <CookieMainInformation />
            <button {...buttonProps} className={styles['accordion-button']}>
              <Icon aria-hidden />
              <span>{settingsButtonText}</span>
            </button>
            <Card
              {...contentProps}
              theme={{
                '--padding-horizontal': '0',
                '--padding-vertical': ' var(--spacing-layout-2-xs)',
              }}
            >
              <CookieDetails
                requiredConsents={cookieConsentContext.getRequired()}
                optionalConsents={cookieConsentContext.getOptional()}
                onChange={onChange}
              />
            </Card>
            <CookieConsentButtons
              onApproveAll={
                !isOpen
                  ? () => {
                      approveAll();
                    }
                  : undefined
              }
              onApproveRequired={() => {
                approveRequired();
              }}
              onApproveSelectionsAndRequired={
                isOpen
                  ? () => {
                      approveRequired();
                    }
                  : undefined
              }
            />
            <div
              className={styles['language-switcher']}
              data-testid="cookie-consent-language-switcher"
            >
              <LanguageSwitcher />
            </div>
          </div>
        </FocusKeeper>
      </div>
      <div aria-hidden className={styles.overlay}></div>
    </div>
  );
}

export default CookieConsent;
