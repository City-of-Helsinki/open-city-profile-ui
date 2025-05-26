import { v4 as uuidv4 } from 'uuid';
import to from 'await-to-js';

import { Action, ActionExecutor, ActionProps, QueueController } from '../../common/actionQueue/actionQueue';
import { getLoadKeycloakConfigResult } from './loadKeycloakConfig';
import { AuthorizationUrlParams, getActionResultAndErrorMessage, isAuthCodeActionNeeded } from './utils';

type RedirectionProps = Pick<AuthorizationUrlParams, 'state' | 'oidcUri'>;

const keycloakRedirectionInitializationType = 'keycloakRedirectionInitializationType';

export const getAuthCodeRedirectionInitializationResult = (action: Action, queueController: QueueController) =>
  getActionResultAndErrorMessage<RedirectionProps>(keycloakRedirectionInitializationType, queueController).result;

const authCodeRedirectionInitializationExecutor: ActionExecutor = async (action, controller) => {
  if (!isAuthCodeActionNeeded(action, controller)) {
    return Promise.resolve({ state: '', oidcUri: '' });
  }
  const [error, oidcUri] = await to(
    Promise.resolve(getLoadKeycloakConfigResult(controller)), // tunnistus
  );

  if (error || !oidcUri) {
    return Promise.reject(new Error('Failed to get oidc auth uri'));
  }
  return Promise.resolve({ state: uuidv4(), oidcUri });
};

export const keycloakRedirectionInitializationAction: ActionProps = {
  type: keycloakRedirectionInitializationType,
  executor: authCodeRedirectionInitializationExecutor,
};
