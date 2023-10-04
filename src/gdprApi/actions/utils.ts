import {
  Action,
  ActionType,
  JSONStringifyableResult,
  QueueController,
} from '../../common/actionQueue/actionQueue';
import { tunnistamoRedirectionInitializationAction } from './authCodeRedirectionInitialization';
import {
  isTunnistamoAuthorisationCodeNeeded,
  isKeycloakAuthorisationCodeNeeded,
} from './getGdprScopes';

export type AuthorizationUrlParams = {
  oidcUri: string;
  clientId: string;
  scopes: string[];
  redirectUri: string;
  state: string;
};

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
  return action.type === tunnistamoRedirectionInitializationAction.type;
}

export function isAuthCodeActionNeeded(
  action: Action,
  controller: QueueController
): boolean {
  return isTunnistamoAuthCodeAction(action)
    ? isTunnistamoAuthorisationCodeNeeded(controller)
    : isKeycloakAuthorisationCodeNeeded(controller);
}
