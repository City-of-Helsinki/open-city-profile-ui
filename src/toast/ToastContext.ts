import { createContext } from 'react';

import { LaxToast } from './types';

export interface ToastContextType {
  createToast: (toast?: LaxToast) => string;
  hideToast: (toastId: string) => void;
  deleteToast: (toastId: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  createToast: (): string => '',
  hideToast: () => {
    // pass - some zero effect change here
  },
  deleteToast: () => {
    // pass
  },
});

export default ToastContext;
