import React, { PropsWithChildren } from 'react';
import { DismissableNotification } from 'hds-react';
import { useTranslation } from 'react-i18next';

import styles from './NotificationComponent.module.css';

type Props = PropsWithChildren<{
  show: boolean;
  labelText?: string;
  type?: 'error' | 'success' | 'warning' | 'notification';
  onClose?: () => void;
}>;

function NotificationComponent(props: Props) {
  const { t } = useTranslation();
  if (!props.show) return null;
  return (
    <div className={styles.notification}>
      <DismissableNotification
        type={props.type || 'error'}
        labelText={props.labelText || t('notification.defaultErrorTitle')}
        closeButtonLabelText={t('notification.closeButtonText')}
        onClose={props.onClose}
      >
        <div className={styles.messageWrapper}>
          {props.children || t('notification.defaultErrorText')}
        </div>
      </DismissableNotification>
    </div>
  );
}

export default NotificationComponent;
