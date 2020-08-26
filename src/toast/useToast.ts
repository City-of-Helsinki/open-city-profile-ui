import React from 'react';

import ToastContext from './ToastContext';

function useToast() {
  return React.useContext(ToastContext);
}

export default useToast;
