import { useHistory } from 'react-router';
import { useMemo, useRef } from 'react';

import {
  Action,
  ActionExecutorPromise,
  ActionProps,
  ActionType,
  JSONStringifyableResult,
  QueueController,
} from '../../common/actionQueue/actionQueue';
import config from '../../config';
import {
  isTunnistamoAuthorisationCodeNeeded,
  isKeycloakAuthorisationCodeNeeded,
} from './getGdprScopes';
import { tunnistamoRedirectionInitializationAction } from './authCodeRedirectionInitialization';
import { tunnistamoAuthCodeParserAction } from './authCodeParser';
import { tunnistamoAuthCodeRedirectionAction } from './authCodeRedirectionHandler';
import { tunnistamoAuthCodeCallbackUrlAction } from './authCodeCallbackUrlDetector';
import { AnyObject } from '../../graphql/typings';
import matchUrls from '../../common/helpers/matchUrls';
import { getStartPagePathFromQueue } from './redirectionHandlers';

export type AuthorizationUrlParams = {
  oidcUri: string;
  clientId: string;
  scopes: string[];
  redirectUri: string;
  state: string;
};

type RedirectionRequest = {
  isRedirectionRequest: boolean;
  path: string;
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
    action.type === tunnistamoAuthCodeParserAction.type ||
    action.type === tunnistamoAuthCodeCallbackUrlAction.type ||
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

export function isGdprCallbackUrl(): boolean {
  return window.location.pathname === config.gdprCallbackPath;
}

export function createInternalRedirectionRequest(
  path: string
): RedirectionRequest {
  return {
    isRedirectionRequest: true,
    path,
  };
}

export function createInternalRedirectionRequestForError(path: string): string {
  return JSON.stringify(createInternalRedirectionRequest(path));
}

export function createTimeOutPromise(
  errorText: string,
  uri?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (uri) {
        window.location.href = uri;
      }
      reject(new Error(errorText));
    }, thirtySecondsInMs);
  });
}

export function createFailedActionParams(
  action: Action | ActionProps,
  message = '',
  append = false
) {
  const params = new URLSearchParams(append ? window.location.search : '');
  params.append('error', action.type);
  if (message) {
    params.append('message', message);
  }
  return params.toString();
}

export function getFailedActionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('error') || '';
}

export function createPagePathWithFailedActionParams(
  path: string,
  action?: Action | ActionProps,
  errorText?: string
) {
  if (!action) {
    return path;
  }
  return `${path}?${createFailedActionParams(action, errorText)}`;
}

export function parseRequestPath(
  source: AnyObject | undefined
): string | undefined {
  return typeof source === 'object' && source.isRedirectionRequest
    ? (source.path as string)
    : undefined;
}

export function getInternalRequestPathFromResult(action: Action) {
  const result = action.complete
    ? (action.result as RedirectionRequest)
    : undefined;
  return parseRequestPath(result);
}

export function getInternalRequestPathFromError(action: Action) {
  const errorMessage = action.complete ? action.errorMessage : undefined;
  if (!errorMessage || !errorMessage.includes('isRedirectionRequest')) {
    return undefined;
  }
  try {
    return parseRequestPath(JSON.parse(errorMessage));
  } catch (e) {
    return undefined;
  }
}

export function getInternalRequestPathFromAction(action: Action) {
  return (
    getInternalRequestPathFromResult(action) ||
    getInternalRequestPathFromError(action)
  );
}

export function rejectExecutorWithRedirection(
  path: string,
  action: Action | ActionProps,
  errorText?: string,
  timeout = 0
): ActionExecutorPromise {
  const errorMessage = createInternalRedirectionRequestForError(
    createPagePathWithFailedActionParams(path, action, errorText)
  );
  const error = new Error(errorMessage);
  if (timeout) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(error);
      }, timeout);
    });
  }
  return Promise.reject(error);
}
export function rejectExecutorWithStartPageRedirection(
  controller: QueueController,
  action: Action | ActionProps,
  errorText?: string,
  timeout = 0
): ActionExecutorPromise {
  const path = getStartPagePathFromQueue(controller);
  if (!path) {
    throw new Error('The queue has not start page path action');
  }
  const errorMessage = createInternalRedirectionRequestForError(
    createPagePathWithFailedActionParams(path, action, errorText)
  );
  const error = new Error(errorMessage);
  if (timeout) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(error);
      }, timeout);
    });
  }
  return Promise.reject(error);
}

export function parseAuthorizationCallbackUrl(): {
  code: string;
  state: string;
} {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code') || '';
  const state = params.get('state') || '';
  return {
    code,
    state,
  };
}

export function createNextActionParams(
  action: Action | ActionProps,
  append = false
) {
  const params = new URLSearchParams(append ? window.location.search : '');
  params.append('next', action.type);
  return params.toString();
}

export function getNextActionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('next') || '';
}

export function resolveExecutorWithRedirection(
  path: string,
  nextAction: Action | ActionProps
): ActionExecutorPromise {
  const result = createInternalRedirectionRequest(
    `${path}?${createNextActionParams(nextAction)}`
  );
  return Promise.resolve(result);
}

// There cannot be more than one redirection active - in the last completed action.
// This hook allows one redirection per initialization.
// The hook is cleared when a component using it is unmounted, so it is reset on each mount.
export function useInternalRedirect(
  controller: QueueController
): {
  check: () => boolean;
  reset: () => void;
  redirect: (path: string) => boolean;
} {
  const currentRedirectPath = useRef<string | undefined>();
  const history = useHistory();
  const isRouteMatch = (path?: string) => (path ? matchUrls(path) : false);
  const funcs = useMemo(() => {
    const reset = () => (currentRedirectPath.current = undefined);
    const redirect = (path: string) => {
      if (currentRedirectPath.current || isRouteMatch(path)) {
        return false;
      }
      history.push(path);
      currentRedirectPath.current = path;
      return true;
    };
    const check = () => {
      if (currentRedirectPath.current) {
        if (isRouteMatch(currentRedirectPath.current)) {
          currentRedirectPath.current = undefined;
        } else {
          return true;
        }
      }
      const completedActions = controller.getComplete();
      const lastCompleteAction = completedActions.length
        ? completedActions[completedActions.length - 1]
        : undefined;
      const path = lastCompleteAction
        ? getInternalRequestPathFromAction(lastCompleteAction)
        : undefined;
      if (!path) {
        return false;
      }
      return redirect(path);
    };

    return {
      check,
      reset,
      redirect,
    };
  }, [controller, history]);
  return funcs;
}
