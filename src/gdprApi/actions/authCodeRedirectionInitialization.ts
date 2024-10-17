import { v4 as uuidv4 } from 'uuid';
import to from 'await-to-js';

import {
  Action,
  ActionExecutor,
  ActionProps,
  QueueController,
} from '../../common/actionQueue/actionQueue';
import { getLoadKeycloakConfigResult } from './loadKeycloakConfig';
import {
  AuthorizationUrlParams,
  getActionResultAndErrorMessage,
  isAuthCodeActionNeeded,
  isTunnistamoAuthCodeAction,
} from './utils';

type RedirectionProps = Pick<AuthorizationUrlParams, 'state' | 'oidcUri'>;

const tunnistamoRedirectionInitializationType =
  'tunnistamoRedirectionInitialization';
const keycloakRedirectionInitializationType =
  'keycloakRedirectionInitializationType';

export const getAuthCodeRedirectionInitializationResult = (
  action: Action,
  queueController: QueueController
) =>
  getActionResultAndErrorMessage<RedirectionProps>(
    isTunnistamoAuthCodeAction(action)
      ? tunnistamoRedirectionInitializationType
      : keycloakRedirectionInitializationType,
    queueController
  ).result;

// TODO: Should this be here?
const getAuthorizationEndpoint = (): string =>
  // Replacing: authService.userManager.metadataService.getAuthorizationEndpoint()
  `${window._env_.REACT_APP_OIDC_AUTHORITY}openid/authorize`;

const authCodeRedirectionInitializationExecutor: ActionExecutor = async (
  action,
  controller
) => {
  if (!isAuthCodeActionNeeded(action, controller)) {
    return Promise.resolve({ state: '', oidcUri: '' });
  }
  const [error, oidcUri] = await to(
    isTunnistamoAuthCodeAction(action)
      ? Promise.resolve(getAuthorizationEndpoint())
      : Promise.resolve(getLoadKeycloakConfigResult(controller)) // tunnistus
  );

  if (error || !oidcUri) {
    return Promise.reject(new Error('Failed to get oidc auth uri'));
  }
  return Promise.resolve({ state: uuidv4(), oidcUri });
};

export const tunnistamoRedirectionInitializationAction: ActionProps = {
  type: tunnistamoRedirectionInitializationType,
  executor: authCodeRedirectionInitializationExecutor,
};

export const keycloakRedirectionInitializationAction: ActionProps = {
  type: keycloakRedirectionInitializationType,
  executor: authCodeRedirectionInitializationExecutor,
};
