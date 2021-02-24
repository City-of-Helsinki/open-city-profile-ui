import React from 'react';
import { Notification } from 'hds-react';

import { NotificationContent } from './useNotificationContent';
import styles from './EditingNotifications.module.css';

type Props = {
  content: NotificationContent;
};

function EditingNotifications({ content }: Props): React.ReactElement | null {
  if (!content.text) {
    return null;
  }
  return (
    <div className={styles.wrapper}>
      <Notification
        type={content.error ? 'error' : 'success'}
        label={content.text}
      />
    </div>
  );
}

export default EditingNotifications;
