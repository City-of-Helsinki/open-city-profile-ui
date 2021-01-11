import React from 'react';

import ToastContext, { ToastContextType } from './ToastContext';

function useToast(): ToastContextType {
  return React.useContext(ToastContext);
}

export default useToast;
