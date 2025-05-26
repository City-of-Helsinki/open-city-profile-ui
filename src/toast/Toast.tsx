import React from 'react';

import Notification from '../common/notification/NotificationComponent';
import { Toast as ToastType } from './types';

interface Props extends ToastType {
  onClose: () => void;
}

function Toast({ title, type, onClose, hidden, description }: Props): React.ReactElement {
  return (
    <Notification show={!hidden} labelText={title} type={type} onClose={onClose}>
      {description}
    </Notification>
  );
}

export default Toast;
