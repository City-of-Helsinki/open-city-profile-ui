import { NotificationType } from 'hds-react';

import { PUSH_TOAST, DELETE_TOAST, HIDE_TOAST } from './toastActions';

export type ToastTypes = NotificationType;

export interface Toast {
  title?: string;
  description?: string;
  id: string;
  type: ToastTypes;
  hidden: boolean;
}

export interface LaxToast {
  title?: string;
  description?: string;
  id?: string;
  type?: ToastTypes;
  hidden?: boolean;
}

export interface ToastState {
  toasts: Toast[];
}

export type ToastPushAction = {
  type: typeof PUSH_TOAST;
  toast: Toast;
};

export type ToastDeleteAction = {
  type: typeof DELETE_TOAST;
  toastId: string;
};

export type ToastHideAction = {
  type: typeof HIDE_TOAST;
  toastId: string;
};

export type ToastActions =
  | ToastPushAction
  | ToastDeleteAction
  | ToastHideAction;
