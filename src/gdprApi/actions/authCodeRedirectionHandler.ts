import {
  Action,
  ActionExecutor,
  ActionOptions,
  ActionProps,
  QueueController,
} from '../../common/actionQueue/actionQueue';
import {
  delayRedirection,
  getActionResultAndErrorMessage,
  isAuthCodeActionNeeded,
  isTunnistamoAuthCodeAction,
  makeAuthorizationUrl,
} from './utils';
import { getFetchedScopes } from './getGdprScopes';
import config from '../../config';
import { getAuthCodeRedirectionInitializationResult } from './authCodeRedirectionInitialization';

const tunnistamoAuthCodeRedirectionType = 'tunnistamoAuthCodeRedirection';
const keycloakAuthCodeRedirectionType = 'keycloakAuthCodeRedirection';

export const isQueueWaitingForAuthCodeRedirection = (
  controller: QueueController
) => {
  const activeAction = controller.getActive();
  if (!activeAction) {
    return false;
  }
  return (
    activeAction.type === tunnistamoAuthCodeRedirectionType ||
    activeAction.type === keycloakAuthCodeRedirectionType
  );
};

export const getAuthCodeRedirectionResult = (
  action: Action,
  queueController: QueueController
) =>
  getActionResultAndErrorMessage<boolean>(
    isTunnistamoAuthCodeAction(action)
      ? tunnistamoAuthCodeRedirectionType
      : keycloakAuthCodeRedirectionType,
    queueController
  ).result;

const authCodeRedirectionHandlerExecutor: ActionExecutor = async (
  action,
  controller
) => {
  if (!isAuthCodeActionNeeded(action, controller)) {
    return Promise.resolve(false);
  }

  const stateAndUri = getAuthCodeRedirectionInitializationResult(
    action,
    controller
  );

  if (!stateAndUri || !stateAndUri.state || !stateAndUri.oidcUri) {
    return Promise.reject('No state or oidcUri found');
  }

  const scopes = getFetchedScopes(controller);

  if (!scopes) {
    return Promise.reject('No scopes found');
  }

  const forTunnistamo = isTunnistamoAuthCodeAction(action);
  const scopesToUse = forTunnistamo ? scopes.tunnistamoScopes : [];
  const clientId = forTunnistamo
    ? config.tunnistamoGdprClientId
    : config.keycloakGdprClientId;

  const props = {
    ...stateAndUri,
    scopes: ['openid', ...scopesToUse],
    clientId,
    redirectUri: `${window.location.origin}${config.gdprCallbackPath}`,
  };

  delayRedirection(makeAuthorizationUrl(props));
  return Promise.resolve(true);
};

const options: ActionOptions = {
  noStorage: true,
};

export const tunnistamoAuthCodeRedirectionAction: ActionProps = {
  type: tunnistamoAuthCodeRedirectionType,
  executor: authCodeRedirectionHandlerExecutor,
  options,
};

export const keycloakAuthCodeRedirectionAction: ActionProps = {
  type: keycloakAuthCodeRedirectionType,
  executor: authCodeRedirectionHandlerExecutor,
  options,
};
