import React from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuid } from 'uuid';

import ToastContext from './ToastContext';
import toastReducer from './toastReducer';
import Toast from './Toast';
import {
  pushToast,
  deleteToast as deleteToastActionCreator,
  hideToast as hideToastActionCreator,
} from './toastActions';
import { Toast as ToastType, LaxToast } from './types';
import styles from './toast.module.css';

const TOAST_ROOT_DOM_NODE_ID = 'toast-root';

interface Props {
  children: React.ReactElement;
}

function ToastProvider({ children }: Props) {
  const [state, dispatch] = React.useReducer(toastReducer, { toasts: [] });

  const createToast = React.useCallback((toast: LaxToast = {}): string => {
    const id = uuid();
    const toastWithDefaults: ToastType = {
      id: uuid(),
      type: 'notification',
      hidden: false,
      ...toast,
    };

    dispatch(pushToast(toastWithDefaults));

    return id;
  }, []);

  function deleteToast(toastId: string) {
    dispatch(deleteToastActionCreator(toastId));
  }

  function hideToast(toastId: string) {
    dispatch(hideToastActionCreator(toastId));
  }

  function handleCloseToast(toastId: string) {
    // Use timeout to make sure that the notification has time to set
    // its own state before it's removed from the dom. Otherwise React
    // will log a memory leak error.
    setTimeout(() => {
      deleteToast(toastId);
    });
  }

  const toasts = state.toasts;

  const toastRoot = document.getElementById(TOAST_ROOT_DOM_NODE_ID);

  // After a logout, if the user goes back into /profile-deleted, the
  // root element for toast may be missing.
  if (!toastRoot) {
    return children;
  }

  return (
    <ToastContext.Provider
      value={{
        createToast,
        hideToast,
        deleteToast,
      }}
    >
      {ReactDOM.createPortal(
        <div className={styles.toastContainer}>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={() => handleCloseToast(toast.id)}
            />
          ))}
        </div>,
        toastRoot
      )}
      {children}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
