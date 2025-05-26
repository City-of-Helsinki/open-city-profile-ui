import {
  Action,
  ActionExecutor,
  ActionOptions,
  ActionProps,
  QueueController,
} from '../../common/actionQueue/actionQueue';
import {
  getActionResultAndErrorMessage,
  isAuthCodeActionNeeded,
  parseAuthorizationCallbackUrl,
  rejectExecutorWithStartPageRedirection,
} from './utils';
import { getAuthCodeRedirectionInitializationResult } from './authCodeRedirectionInitialization';

const keycloakAuthCodeParserType = 'keycloakAuthCodeParser';
const dummyKeycloakAuthCode = 'dummyKeycloakAuthCode';

export const getStoredKeycloakAuthCode = (queueController: QueueController) =>
  getActionResultAndErrorMessage<string>(keycloakAuthCodeParserType, queueController).result;

const authCodeParserExecutor: ActionExecutor = async (action, controller) => {
  if (!isAuthCodeActionNeeded(action, controller)) {
    return Promise.resolve(dummyKeycloakAuthCode);
  }

  const rejector = (message: string) => rejectExecutorWithStartPageRedirection(controller, action, message);

  const { code, state } = parseAuthorizationCallbackUrl();
  if (!code || !state) {
    return rejector('No code or state found in callback url');
  }

  const storedUrlProps = getAuthCodeRedirectionInitializationResult(action, controller);
  if (!storedUrlProps) {
    return rejector('Stored state not found');
  }
  if (!state || !storedUrlProps.state || storedUrlProps.state !== state) {
    return rejector('State is not for this action');
  }
  return Promise.resolve(code);
};

const options: ActionOptions = {
  idleWhenActive: true,
};
const data: Action['data'] = {
  redirectsOnError: true,
};

export const keycloakAuthCodeParserAction: ActionProps = {
  type: keycloakAuthCodeParserType,
  executor: authCodeParserExecutor,
  options,
  data,
};
