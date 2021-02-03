import React from 'react';
import { Notification } from 'hds-react';

import { NotificationContent } from './useNotificationContent';

type Props = {
  content: NotificationContent;
};

function EditingNotifications({ content }: Props): React.ReactElement | null {
  if (!content.text) {
    return null;
  }
  return (
    <Notification
      type={content.error ? 'error' : 'success'}
      label={content.text}
    />
  );
}

export default EditingNotifications;
