import React from 'react';

import Notification from '../../../common/copyOfHDSNotification/Notification';
import { NotificationContent } from './useNotificationContent';
import styles from './EditingNotifications.module.css';
import { EditDataType } from '../../helpers/editData';

type Props = {
  content: NotificationContent;
  dataType: EditDataType;
};

function EditingNotifications({
  content,
  dataType,
}: Props): React.ReactElement | null {
  if (!content.text) {
    return null;
  }
  return (
    <div
      className={styles.wrapper}
      role="alert"
      id={`${dataType}-edit-notifications`}
    >
      <Notification
        type={content.error ? 'error' : 'success'}
        label={content.text}
      />
    </div>
  );
}

export default EditingNotifications;
