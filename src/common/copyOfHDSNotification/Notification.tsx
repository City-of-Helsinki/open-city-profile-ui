/*
  This is a copy of HDS Notification component
  There is a bug in React-spring that is used by HDS
  https://github.com/pmndrs/react-spring/issues/1078

  It only occurs in production build and cannot be fixed
  There is no workaround either.

  This component can be removed when bug is fixed or react-spring updated / replaced.

*/
import React, { useCallback, useEffect, useState } from 'react';
import { VisuallyHidden } from '@react-aria/visually-hidden';
import {
  NotificationProps,
  IconInfoCircle,
  IconError,
  IconAlertCircle,
  IconCheck,
  IconCross,
} from 'hds-react';
import classNames from 'classnames';

import styles from './Notification.module.css';

// Icon mapping for notification types
const icons = {
  info: IconInfoCircle,
  success: IconCheck,
  error: IconError,
  alert: IconAlertCircle,
};

/**
 * Conditionally hides the children visually, but leaves them accessible to assistive technology
 */
type VisualProps = {
  visuallyHidden: boolean;
  children: React.ReactNode | 'string';
};
const ConditionalVisuallyHidden = ({
  visuallyHidden,
  children,
}: VisualProps): React.ReactElement =>
  visuallyHidden ? (
    <VisuallyHidden>{children}</VisuallyHidden>
  ) : (
    (children as React.ReactElement)
  );

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  (
    {
      autoClose = false,
      autoCloseDuration = 6000,
      children,
      className = '',
      closeAnimationDuration = 85,
      closeButtonLabelText,
      dataTestId,
      dismissible = false,
      invisible = false,
      label,
      position = 'inline',
      onClose = () => null,
      size = 'default',
      type = 'info',
    }: NotificationProps,
    ref
  ) => {
    // only allow size 'large' for inline notifications
    if (position !== 'inline' && size === 'large') {
      // eslint-disable-next-line no-console
      console.warn(
        `Size '${size}' is only allowed for inline positioned notifications`
      );
      // eslint-disable-next-line no-param-reassign
      size = 'default';
    }
    // don't allow autoClose for inline notifications
    if (position === 'inline' && autoClose) {
      // eslint-disable-next-line no-console
      console.warn(
        `The 'autoClose' property is not allowed for inline positioned notifications`
      );
      // eslint-disable-next-line no-param-reassign
      autoClose = false;
    }

    // internal state
    const [open, setOpen] = useState(true);

    const handleClose = useCallback(() => {
      // trigger close animation
      setOpen(false);
      // emit onClose callback after the animation is completed
      setTimeout(() => onClose(), closeAnimationDuration);
    }, [onClose, closeAnimationDuration]);

    useEffect(() => {
      const interval = setTimeout(() => {
        if (autoClose) {
          handleClose();
        }
      }, autoCloseDuration);
      return () => clearTimeout(interval);
    }, [autoClose, autoCloseDuration, handleClose]);

    // icon
    const Icon = icons[type];

    // Set role="alert" for non-inline notifications
    const role = position !== 'inline' ? 'alert' : undefined;

    if (!open) {
      return null;
    }

    return (
      <ConditionalVisuallyHidden visuallyHidden={invisible}>
        <section
          className={classNames(
            styles[position],
            styles['notification'],
            styles[size],
            styles[type],
            autoClose && styles['no-border'],
            className
          )}
          aria-label="Notification"
          aria-atomic="true"
          data-testid={dataTestId}
        >
          <div className={styles['content']} role={role} ref={ref}>
            <div className={styles['label']} role="heading" aria-level={2}>
              <Icon className={styles['icon']} aria-hidden />
              <ConditionalVisuallyHidden visuallyHidden={size === 'small'}>
                {label}
              </ConditionalVisuallyHidden>
            </div>
            {children && <div className={styles['body']}>{children}</div>}
          </div>
          {dismissible && (
            <button
              className={classNames(styles['close'], styles[type])}
              type="button"
              title={closeButtonLabelText}
              aria-label={closeButtonLabelText}
              onClick={handleClose}
            >
              <IconCross aria-hidden />
            </button>
          )}
        </section>
      </ConditionalVisuallyHidden>
    );
  }
);

export default Notification;
