import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Action } from '../../helpers/mutationEditor';

export type NotificationContent = { error: boolean; text: string };
export type ContentHandlers = {
  setSuccessMessage: (message: string, action?: Action) => void;
  setErrorMessage: (message: string, action?: Action) => void;
  clearMessage: () => void;
  content: NotificationContent;
};
function useNotificationContent(): ContentHandlers {
  const [content, setMessage] = useState<NotificationContent>({
    error: false,
    text: '',
  });
  const { t } = useTranslation();
  const tryAgainKey = 'notification.tryAgain';
  const getActionMessage = (action: Action, error: boolean): string => {
    if (action === 'remove') {
      return error
        ? `${t('notification.removeError')} ${t(tryAgainKey)}`
        : t('notification.removeSuccess');
    }
    if (action === 'save') {
      return error
        ? `${t('notification.saveError')} ${t(tryAgainKey)}`
        : t('notification.saveSuccess');
    }
    return error
      ? `${t('notification.genericError')} ${t(tryAgainKey)}`
      : t('notification.genericSuccess');
  };
  const setSuccessMessage: ContentHandlers['setSuccessMessage'] = (
    message,
    action
  ) => {
    setMessage({
      error: false,
      text: action ? getActionMessage(action, false) : message,
    });
  };
  const setErrorMessage: ContentHandlers['setErrorMessage'] = (
    message,
    action
  ) => {
    setMessage({
      error: true,
      text: action ? getActionMessage(action, true) : message,
    });
  };
  const clearMessage: ContentHandlers['clearMessage'] = () => {
    setMessage({ error: false, text: '' });
  };

  return {
    setSuccessMessage,
    setErrorMessage,
    clearMessage,
    content,
  };
}

export default useNotificationContent;
