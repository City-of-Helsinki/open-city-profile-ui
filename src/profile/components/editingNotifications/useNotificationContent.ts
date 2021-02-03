import { useState } from 'react';

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
  const getActionMessage = (action: Action, error: boolean): string => {
    if (action === 'remove') {
      return error ? 'Poisto epäonnistui. Yritä uudelleen.' : 'Poisto onnistui';
    }
    if (action === 'save') {
      return error
        ? 'Tallennus epäonnistui.Yritä uudelleen.'
        : 'Tallennus onnistui';
    }
    return error ? 'Tapahtui virhe' : 'Toiminto onnistui';
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
