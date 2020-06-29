import {
  Toast,
  ToastPushAction,
  ToastDeleteAction,
  ToastHideAction,
} from './types';

export const PUSH_TOAST = 'PUSH_TOAST';
export const DELETE_TOAST = 'DELETE_TOAST';
export const HIDE_TOAST = 'HIDE_TOAST';

export function pushToast(toast: Toast): ToastPushAction {
  return {
    type: PUSH_TOAST,
    toast,
  };
}

export function deleteToast(toastId: string): ToastDeleteAction {
  return {
    type: DELETE_TOAST,
    toastId,
  };
}

export function hideToast(toastId: string): ToastHideAction {
  return {
    type: HIDE_TOAST,
    toastId,
  };
}
