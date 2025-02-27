import React, { forwardRef } from 'react';
import { Notification } from 'hds-react';
import classNames from 'classnames';

import { NotificationContent } from './useNotificationContent';
import styles from './EditingNotifications.module.css';
import { EditDataType } from '../../helpers/editData';

type Props = {
  content: NotificationContent;
  dataType: EditDataType | 'password' | 'totp';
  bottomSpacing?: boolean;
  noSpacing?: boolean;
  bottomSpacingDesktop?: boolean;
  topSpacingMobile?: boolean;
};

// Forwarding ref to the outer div
const EditingNotifications = forwardRef<HTMLDivElement, Props>(
  function EditingNotifications(
    {
      content,
      dataType,
      bottomSpacing,
      bottomSpacingDesktop,
      topSpacingMobile,
      noSpacing,
    }: Props,
    ref
  ): React.ReactElement | null {
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
        ref={ref} // Attach the ref to the div
        className={classNames(...classList)}
        role="alert"
        id={`${dataType}-edit-notifications`}
      >
        <Notification
          type={content.error ? 'error' : 'success'}
          size={'small'}
          label={content.text}
        >
          {content.text}
        </Notification>
      </div>
    );
  }
);

export default EditingNotifications;
