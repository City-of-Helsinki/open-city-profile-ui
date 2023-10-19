import {
  Action,
  ActionExecutor,
  ActionOptions,
  ActionProps,
} from '../../common/actionQueue/actionQueue';
import config from '../../config';
import { getAuthCodeRedirectionInitializationResult } from './authCodeRedirectionInitialization';
import {
  isAuthCodeActionNeeded,
  isGdprCallbackUrl,
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

const tunnistamoAuthCodeCallbackUrlDetectorType =
  'tunnistamoAuthCodeCallbackUrlDetector';

const keycloakAuthCodeCallbackUrlDetectorType =
  'keycloakAuthCodeCallbackUrlDetectorType';

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
    // When two gdpr auth code redirections are made, the browser can still
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
};

const data: Action['data'] = {
  requiredPath: config.gdprCallbackPath,
  redirectsOnError: true,
};

export const tunnistamoAuthCodeCallbackUrlAction: ActionProps = {
  type: tunnistamoAuthCodeCallbackUrlDetectorType,
  executor: authCodeCallbackUrlDetectorExecutor,
  options,
  data,
};

export const keycloakAuthCodeCallbackUrlAction: ActionProps = {
  type: keycloakAuthCodeCallbackUrlDetectorType,
  executor: authCodeCallbackUrlDetectorExecutor,
  options,
  data,
};
