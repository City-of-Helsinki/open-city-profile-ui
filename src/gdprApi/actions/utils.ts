import {
  Action,
  ActionType,
  JSONStringifyableResult,
  QueueController,
} from '../../common/actionQueue/actionQueue';
import {
  isTunnistamoAuthorisationCodeNeeded,
  isKeycloakAuthorisationCodeNeeded,
} from './getGdprScopes';
import { tunnistamoRedirectionInitializationAction } from './authCodeRedirectionInitialization';
import { tunnistamoAuthCodeRedirectionAction } from './authCodeRedirectionHandler';

export type AuthorizationUrlParams = {
  oidcUri: string;
  clientId: string;
  scopes: string[];
  redirectUri: string;
  state: string;
};

export const thirtySecondsInMs = 30 * 1000;

export function getActionResultAndErrorMessage<T = JSONStringifyableResult>(
  actionType: ActionType,
  controller: QueueController
): { result: T | undefined; errorMessage: string | undefined } {
  const action = controller.getByType(actionType);
  if (!action) {
    return {
      result: undefined,
      errorMessage: undefined,
    };
  }
  const { result, errorMessage } = action;
  return {
    result: (result as unknown) as T,
    errorMessage,
  };
}

export function isTunnistamoAuthCodeAction(action: Action): boolean {
  return (
    action.type === tunnistamoRedirectionInitializationAction.type ||
    action.type === tunnistamoAuthCodeRedirectionAction.type
  );
}
export function isAuthCodeActionNeeded(
  action: Action,
  controller: QueueController
): boolean {
  return isTunnistamoAuthCodeAction(action)
    ? isTunnistamoAuthorisationCodeNeeded(controller)
    : isKeycloakAuthorisationCodeNeeded(controller);
}

export function delayRedirection(uri: string) {
  return setTimeout(() => {
    window.location.assign(uri);
  }, 60);
}

export function makeAuthorizationUrl(
  urlParams: AuthorizationUrlParams
): string {
  const { oidcUri, clientId, scopes, redirectUri, state } = urlParams;
  const scope = scopes.join(' ');
  const params = new URLSearchParams();

  params.append('response_type', 'code');
  params.append('client_id', clientId);
  params.append('scope', scope);
  params.append('redirect_uri', redirectUri);
  params.append('state', state);

  return `${oidcUri}?${params.toString()}`;
}
