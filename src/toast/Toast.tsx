import React from 'react';

import Notification from '../common/notification/NotificationComponent';
import { ToastTypes } from './types';

interface Props {
  title?: string;
  description?: string;
  // eslint-disable-next-line react/no-unused-prop-types
  id: string;
  type?: ToastTypes;
  onClose: () => void;
  hidden: boolean;
}

function Toast({
  title,
  type,
  onClose,
  hidden,
  description,
}: Props): React.ReactElement {
  return (
    <Notification
      show={!hidden}
      labelText={title}
      type={type}
      onClose={onClose}
    >
      {description}
    </Notification>
  );
}

export default Toast;
