import { PUSH_TOAST, DELETE_TOAST, HIDE_TOAST } from './toastActions';
import { ToastState, ToastActions } from './types';

function toastReducer(state: ToastState, action: ToastActions): ToastState {
  switch (action.type) {
    case PUSH_TOAST:
      return {
        toasts: [...state.toasts, action.toast],
      };
    case DELETE_TOAST:
      const deleteId = action.toastId;

      return {
        toasts: state.toasts.filter(toast => toast.id !== deleteId),
      };
    case HIDE_TOAST:
      const hideId = action.toastId;

      return {
        toasts: state.toasts.map(toast => {
          if (toast.id !== hideId) {
            return toast;
          }

          return {
            ...toast,
            hidden: true,
          };
        }),
      };
    default:
      throw new Error();
  }
}

export default toastReducer;
