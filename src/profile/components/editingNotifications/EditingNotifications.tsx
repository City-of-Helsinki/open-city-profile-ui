import React from 'react';
import { Notification } from 'hds-react';
import classNames from 'classnames';

import { NotificationContent } from './useNotificationContent';
import styles from './EditingNotifications.module.css';
import { EditDataType } from '../../helpers/editData';

type Props = {
  content: NotificationContent;
  dataType: EditDataType | 'password';
  bottomSpacing?: boolean;
  noSpacing?: boolean;
  bottomSpacingDesktop?: boolean;
  topSpacingMobile?: boolean;
};

function EditingNotifications({
  content,
  dataType,
  bottomSpacing,
  bottomSpacingDesktop,
  topSpacingMobile,
  noSpacing,
}: Props): React.ReactElement | null {
  if (!content.text) {
    return null;
  }
  const classList = [styles.wrapper];
  if (bottomSpacing) {
    classList.push(styles['bottom-padding']);
  } else if (noSpacing) {
    classList.push(styles['no-padding']);
  }
  if (bottomSpacingDesktop) {
    classList.push(styles['bottom-padding-desktop']);
  }
  if (topSpacingMobile) {
    classList.push(styles['top-padding-mobile']);
  }
  return (
    <div
      className={classNames(...classList)}
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
