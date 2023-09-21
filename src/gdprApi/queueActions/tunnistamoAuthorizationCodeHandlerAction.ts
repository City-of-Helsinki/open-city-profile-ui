import {
  ActionExecutor,
  ActionProps,
  QueueFunctions,
} from '../../common/actionQueue/actionQueue';
import gdprAuthCodeManager from '../gdprAuthCodeManager';
import {
  didTunnistamoRedirectHappen,
  tunnistamoAuthorizationCodeRedirectionAction,
} from './tunnistamoAuthorizationCodeRedirectionAction.';

const tunnistamoAuthorizationCodeHandlerActionType =
  'tunnistamoAuthorizationCodeHandler';

export const getTunnistamoAuthorizationCode = (
  queueFunctions: QueueFunctions
): string =>
  (queueFunctions.getResult(
    tunnistamoAuthorizationCodeHandlerActionType
  ) as string) ||
  (queueFunctions.getResult(
    tunnistamoAuthorizationCodeRedirectionAction.type
  ) as string) ||
  '';

const tunnistamoAuthorizationCodeHandlerExecutor: ActionExecutor = async (
  action,
  queueFunctions
) => {
  if (!didTunnistamoRedirectHappen(queueFunctions)) {
    console.log('TS HANDLER not needed!');
    return Promise.resolve('');
  }
  console.log('TS HANDLER  needed!');
  return new Promise((resolve, reject) => {
    (async () => {
      if (window.location.pathname !== '/gdpr-callback') {
        return;
      }
      const code = gdprAuthCodeManager.authorizationCodeFetchCallback();
      console.log('----code', code);
      if (code) {
        resolve(code);
      } else {
        reject(new Error('No code'));
      }
    })();
  });
};

export const tunnistamoAuthorizationCodeHandlerAction: ActionProps = {
  type: tunnistamoAuthorizationCodeHandlerActionType,
  executor: tunnistamoAuthorizationCodeHandlerExecutor,
  options: {
    idleWhenActive: true,
  },
};
