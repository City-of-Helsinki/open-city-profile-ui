import {
  Action,
  ActionExecutor,
  ActionProps,
  QueueFunctions,
} from '../../common/actionQueue/actionQueue';
import gdprAuthCodeManager from '../gdprAuthCodeManager';
import { getScopesFromQueue } from './loadServiceConnectionsAction';

const keycloakAuthorizationCodeHandlerActionType =
  'keycloakAuthorizationCodeHandler';

export const getkeycloakAuthorizationCode = (
  queueFunctions: QueueFunctions
): string | boolean =>
  (queueFunctions.getResult(
    keycloakAuthorizationCodeHandlerActionType
  ) as string) || false;

export const shouldKeycloakHandlerExecute = (action?: Action) => {
  if (!action || action.type !== keycloakAuthorizationCodeHandlerActionType) {
    return false;
  }
  return !action.complete && action.active;
};

const keycloakAuthorizationCodeHandlerExecutor: ActionExecutor = async (
  action,
  queueFunctions
) => {
  const { pureKeyloakServices } = getScopesFromQueue(queueFunctions);

  if (!pureKeyloakServices.length) {
    console.log('KC HANDLER not needed!');
    return Promise.resolve(false);
  }
  console.log('KC HANDLER needed!');
  return new Promise((resolve, reject) => {
    (async () => {
      console.log('window.location.pathname', window.location.pathname);
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

export const keycloakAuthorizationCodeHandlerAction: ActionProps = {
  type: keycloakAuthorizationCodeHandlerActionType,
  executor: keycloakAuthorizationCodeHandlerExecutor,
  options: {
    idleWhenActive: true,
  },
};
