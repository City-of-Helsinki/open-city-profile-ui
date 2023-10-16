import {
  Action,
  ActionExecutor,
  ActionOptions,
  ActionProps,
  QueueController,
  isResumable,
} from '../../common/actionQueue/actionQueue';
import { RunnerFunctions } from '../../common/actionQueue/actionQueueRunner';
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
The auth code redirection action has options.syncronousCompletion = true.
That means it is completed immediately and the the redirection happens in X seconds.
This action is executed when previous ends.
If current url is not the callback url, then this action should stall.
If browser has not redirected in "thirtySecondsInMs", this action fails the queue.
When the redirection happens, the queue is stored and this action is the next,
when browser returns from the oidc server.
*/

const tunnistamoAuthCodeCallbackUrlDetectorType =
  'tunnistamoAuthCodeCallbackUrlDetector';

const keycloakAuthCodeCallbackUrlDetectorType =
  'keycloakAuthCodeCallbackUrlDetectorType';

export const getNextAuthCodeCallbackDetector = (
  controller: QueueController
) => {
  const nextAction = controller.getNext();
  if (!nextAction) {
    return undefined;
  }
  if (nextAction.type === tunnistamoAuthCodeCallbackUrlDetectorType) {
    return tunnistamoAuthCodeCallbackUrlDetectorType;
  }
  if (nextAction.type === keycloakAuthCodeCallbackUrlDetectorType) {
    return keycloakAuthCodeCallbackUrlDetectorType;
  }
  return undefined;
};

export const isQueueWaitingForAuthCodeCallback = (
  controller: QueueController
) => !!getNextAuthCodeCallbackDetector(controller);

export const resumeQueueFromNextCallbackDetector = (
  runner: RunnerFunctions
) => {
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
  if (
    action.type !== tunnistamoAuthCodeCallbackUrlDetectorType &&
    action.type !== keycloakAuthCodeCallbackUrlDetectorType
  ) {
    return false;
  }
  if (!isResumable(action)) {
    return false;
  }
  return isOnActionRequiredPath(action);
};

const authCodeCallbackUrlDetectorExecutor: ActionExecutor = async (
  action,
  controller
) => {
  if (!isAuthCodeActionNeeded(action, controller)) {
    return Promise.resolve(false);
  }

  const isWrongPathOrState = () => {
    if (!isGdprCallbackUrl()) {
      return true;
    }
    // when two gdpr auth code redirections are made, the browser can still
    // be in first call's gdpr callback Url when this action is executed again.
    // State is checked to make sure the callback url is for this action.
    const { state } = parseAuthorizationCallbackUrl();
    const storedUrlProps = getAuthCodeRedirectionInitializationResult(
      action,
      controller
    );
    return state && storedUrlProps && storedUrlProps.state !== state;
  };
  if (isWrongPathOrState()) {
    return rejectExecutorWithStartPageRedirection(
      controller,
      action,
      'Gdpr redirection to server timed out.',
      thirtySecondsInMs
    );
  }
  return Promise.resolve(true);
};

const options: ActionOptions = {
  noStorage: true,
  idleWhenActive: true,
  resumable: true,
  data: {
    requiredPath: config.gdprCallbackPath,
    redirectsOnError: true,
  },
};

export const tunnistamoAuthCodeCallbackUrlAction: ActionProps = {
  type: tunnistamoAuthCodeCallbackUrlDetectorType,
  executor: authCodeCallbackUrlDetectorExecutor,
  options,
};

export const keycloakAuthCodeCallbackUrlAction: ActionProps = {
  type: keycloakAuthCodeCallbackUrlDetectorType,
  executor: authCodeCallbackUrlDetectorExecutor,
  options,
};
