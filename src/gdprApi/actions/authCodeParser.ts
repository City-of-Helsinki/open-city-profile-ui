import {
  ActionExecutor,
  ActionOptions,
  ActionProps,
  QueueController,
} from '../../common/actionQueue/actionQueue';
import {
  getActionResultAndErrorMessage,
  isAuthCodeActionNeeded,
  isTunnistamoAuthCodeAction,
  parseAuthorizationCallbackUrl,
  rejectExecutorWithStartPageRedirection,
} from './utils';
import { getAuthCodeRedirectionInitializationResult } from './authCodeRedirectionInitialization';

const tunnistamoAuthCodeParserType = 'tunnistamoAuthCodeParser';
const keycloakAuthCodeParserType = 'keycloakAuthCodeParser';
const dummyTunnistamoAuthCode = 'dummyTunnistamoAuthCode';

export const getStoredTunnistamoAuthCode = (queueController: QueueController) =>
  getActionResultAndErrorMessage<string>(
    tunnistamoAuthCodeParserType,
    queueController
  ).result;

export const getStoredKeycloakAuthCode = (queueController: QueueController) =>
  getActionResultAndErrorMessage<string>(
    keycloakAuthCodeParserType,
    queueController
  ).result;

const authCodeParserExecutor: ActionExecutor = async (action, controller) => {
  if (!isAuthCodeActionNeeded(action, controller)) {
    return Promise.resolve(
      isTunnistamoAuthCodeAction(action) ? dummyTunnistamoAuthCode : ''
    );
  }

  const { code, state } = parseAuthorizationCallbackUrl();
  if (!code || !state) {
    return Promise.reject('No code or state found in callback url');
  }

  const storedUrlProps = getAuthCodeRedirectionInitializationResult(
    action,
    controller
  );
  if (!storedUrlProps) {
    return Promise.reject('Stored state not found');
  }
  if (!state || !storedUrlProps.state || storedUrlProps.state !== state) {
    return rejectExecutorWithStartPageRedirection(
      controller,
      action,
      'State is not for this action'
    );
  }
  return Promise.resolve(code);
};

const options: ActionOptions = {
  idleWhenActive: true,
};

export const tunnistamoAuthCodeParserAction: ActionProps = {
  type: tunnistamoAuthCodeParserType,
  executor: authCodeParserExecutor,
  options,
};

export const keycloakAuthCodeParserAction: ActionProps = {
  type: keycloakAuthCodeParserType,
  executor: authCodeParserExecutor,
  options,
};
