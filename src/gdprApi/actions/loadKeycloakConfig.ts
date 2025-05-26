import to from 'await-to-js';

import { ActionExecutor, ActionProps, QueueController } from '../../common/actionQueue/actionQueue';
import { getActionResultAndErrorMessage } from './utils';
import { isKeycloakAuthorisationCodeNeeded } from './getGdprScopes';
import config from '../../config';

const loadKeycloakConfigType = 'loadKeycloakConfig';

export const getLoadKeycloakConfigResult = (queueController: QueueController) =>
  getActionResultAndErrorMessage<string>(loadKeycloakConfigType, queueController).result;

const loadKeycloakConfigExecutor: ActionExecutor = async (action, controller) => {
  if (!isKeycloakAuthorisationCodeNeeded(controller)) {
    return Promise.resolve(false);
  }
  const [err, response] = await to(fetch(`${config.keycloakAuthority}.well-known/openid-configuration`));
  if (err) {
    return Promise.reject(err);
  }
  if (!response || !response.ok) {
    return Promise.reject(new Error('Unable to load config'));
  }
  const [parseError, json] = await to(response.json());
  if (parseError) {
    return Promise.reject(err);
  }
  if (!json.authorization_endpoint) {
    return Promise.reject(new Error('authorization_endpoint not set'));
  }
  return Promise.resolve(json.authorization_endpoint);
};

export const loadKeycloakConfigAction: ActionProps = {
  type: loadKeycloakConfigType,
  executor: loadKeycloakConfigExecutor,
};
