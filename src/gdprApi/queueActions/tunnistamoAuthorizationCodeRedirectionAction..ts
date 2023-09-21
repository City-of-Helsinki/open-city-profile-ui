import { getScopesFromQueue } from './loadServiceConnectionsAction';
import {
  Action,
  ActionExecutor,
  ActionProps,
  QueueFunctions,
} from '../../common/actionQueue/actionQueue';
import gdprAuthCodeManager from '../gdprAuthCodeManager';

const tunnistamoAuthorizationCodeRedirectionActionType =
  'tunnistamoAuthorizationCodeRedirection';

const dummyAuthenticationCodeForOnlyKeycloakServices =
  'dummyAuthenticationCodeForOnlyKeycloakServices';

export const didTunnistamoRedirectHappen = (
  queueFunctions: QueueFunctions
): boolean => {
  const result = queueFunctions.getResult(
    tunnistamoAuthorizationCodeRedirectionActionType
  ) as string | boolean;
  return result !== dummyAuthenticationCodeForOnlyKeycloakServices;
};

export const shouldTunnistamoHandlerExecute = (action?: Action) => {
  if (
    !action ||
    action.type !== tunnistamoAuthorizationCodeRedirectionActionType
  ) {
    return false;
  }
  return !action.complete && action.active;
};

const tunnistamoAuthorizationCodeRedirectionExecutor: ActionExecutor = (
  action,
  queueFunctions
) => {
  const tunnistamoScopes = getScopesFromQueue(queueFunctions)
    .tunnistamoServices;
  if (!tunnistamoScopes.length) {
    console.log('TS not needed!');
    return Promise.resolve(dummyAuthenticationCodeForOnlyKeycloakServices);
  }
  console.log('TS needed!');
  gdprAuthCodeManager.fetchAuthorizationCode('download', [
    'openid',
    ...tunnistamoScopes,
  ]);
  return Promise.resolve(false);
};

export const tunnistamoAuthorizationCodeRedirectionAction: ActionProps = {
  type: tunnistamoAuthorizationCodeRedirectionActionType,
  executor: tunnistamoAuthorizationCodeRedirectionExecutor,
};
