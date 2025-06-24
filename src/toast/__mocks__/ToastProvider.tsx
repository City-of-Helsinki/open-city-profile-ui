import React, { useState } from 'react';
import _ from 'lodash';

import ToastContext from '../ToastContext';
import { Toast as ToastType, LaxToast } from '../types';

interface Props {
  children: React.ReactElement;
}

function ToastProvider({ children }: Props): React.ReactElement {
  const [toastProps, setToastProps] = useState<ToastType | undefined>(
    undefined
  );

  const createToast = React.useCallback((toast: LaxToast = {}): string => {
    const toastWithDefaults: ToastType = {
      id: 'mock',
      type: 'info',
      hidden: false,
      ...toast,
    };

    setToastProps(toastWithDefaults);
    return toastWithDefaults.id;
  }, []);

  const hideToast = () => _.noop();
  const deleteToast = () => _.noop();

  return (
    <ToastContext.Provider
      value={{
        createToast,
        hideToast,
        deleteToast,
      }}
    >
      {children}
      <div data-testid="mock-toasts">
        <div
          data-testid={`mock-toast-type-${toastProps ? toastProps.type : 'none'}`}
        />
      </div>
      ,
    </ToastContext.Provider>
  );
}

export default ToastProvider;
