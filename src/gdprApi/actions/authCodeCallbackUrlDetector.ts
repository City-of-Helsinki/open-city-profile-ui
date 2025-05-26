import {
  Action,
  ActionExecutor,
  ActionOptions,
  ActionProps,
  QueueController,
  isResumable,
} from '../../common/actionQueue/actionQueue';
import { QueueRunner } from '../../common/actionQueue/actionQueueRunner';
import config from '../../config';
import { getAuthCodeRedirectionInitializationResult } from './authCodeRedirectionInitialization';
import {
  isAuthCodeActionNeeded,
  isGdprCallbackUrl,
  isOnActionRequiredPath,
  parseAuthorizationCallbackUrl,
  rejectExecutorWithStartPageRedirection,
  thirtySecondsInMs,
} from './utils';

/*
Auth code redirection happens in X seconds. This action is executed when the redirecting action is complete.
If current url is not the callback url, then this action stalls.
If browser has not redirected in "thirtySecondsInMs", this action fails the queue.
When the redirection happens, the queue is stored and this action is the next,
when browser returns from the oidc server.
*/

const keycloakAuthCodeCallbackUrlDetectorType = 'keycloakAuthCodeCallbackUrlDetectorType';

export const getNextAuthCodeCallbackDetector = (controller: QueueController) => {
  const nextAction = controller.getNext();
  if (!nextAction) {
    return undefined;
  }
  if (nextAction.type === keycloakAuthCodeCallbackUrlDetectorType) {
    return keycloakAuthCodeCallbackUrlDetectorType;
  }
  return undefined;
};

export const isQueueWaitingForAuthCodeCallback = (controller: QueueController) =>
  !!getNextAuthCodeCallbackDetector(controller);

export const resumeQueueFromNextCallbackDetector = (runner: QueueRunner) => {
  const actionType = getNextAuthCodeCallbackDetector(runner);
  if (!actionType) {
    return undefined;
  }
  if (runner.resume(actionType)) {
    return actionType;
  }
  return undefined;
};

export const isResumableGdprCallback = (action: Action) => {
  if (action.type !== keycloakAuthCodeCallbackUrlDetectorType) {
    return false;
  }
  if (!isResumable(action)) {
    return false;
  }
  return isOnActionRequiredPath(action);
};

const authCodeCallbackUrlDetectorExecutor: ActionExecutor = async (action, controller) => {
  if (!isAuthCodeActionNeeded(action, controller)) {
    return Promise.resolve(false);
  }

  const isWrongPathOrState = () => {
    if (!isGdprCallbackUrl()) {
      return true;
    }
    // When two gdpr auth code redirections are made, the browser can still
    // be in first call's gdpr callback Url when this action is executed again.
    // State is checked to make sure the callback url is for this action.
    const { state } = parseAuthorizationCallbackUrl();
    const storedUrlProps = getAuthCodeRedirectionInitializationResult(action, controller);
    return state && storedUrlProps && storedUrlProps.state !== state;
  };
  if (isWrongPathOrState()) {
    return rejectExecutorWithStartPageRedirection(
      controller,
      action,
      'Gdpr redirection to server timed out.',
      thirtySecondsInMs,
    );
  }
  return Promise.resolve(true);
};

const options: ActionOptions = {
  noStorage: true,
  idleWhenActive: true,
  resumable: true,
};

const data: Action['data'] = {
  requiredPath: config.gdprCallbackPath,
  redirectsOnError: true,
};

export const keycloakAuthCodeCallbackUrlAction: ActionProps = {
  type: keycloakAuthCodeCallbackUrlDetectorType,
  executor: authCodeCallbackUrlDetectorExecutor,
  options,
  data,
};
