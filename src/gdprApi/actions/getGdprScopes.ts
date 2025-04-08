import to from 'await-to-js';

import { GdprServiceConnectionService } from '../../graphql/typings';
import {
  ActionExecutor,
  ActionProps,
  QueueController,
} from '../../common/actionQueue/actionQueue';
import { getActionResultAndErrorMessage } from './utils';
import { getServiceConnectionsResultAndError } from './getServiceConnections';

type Scopes = Pick<
  GdprServiceConnectionService,
  'gdprQueryScope' | 'gdprDeleteScope'
>;

type ScopesPerOidcType = {
  pureKeyloakServices: Scopes[];
};

type ScopesPerType = {
  keycloakScopes: string[];
};

const gdprQueryScopesType = 'gdprQueryScopes';
const gdprDeleteScopesType = 'gdprDeleteScopes';

export const getFetchedScopes = (queueController: QueueController) => {
  const scopeAction =
    queueController.getByType(gdprQueryScopesType) ||
    queueController.getByType(gdprDeleteScopesType);
  if (!scopeAction) {
    throw new Error('No scope action in queue');
  }

  const { result } = getActionResultAndErrorMessage(
    scopeAction.type,
    queueController
  );
  if (!result) {
    throw new Error('No scopes fetched');
  }
  return result as ScopesPerType;
};

export const isKeycloakAuthorisationCodeNeeded = (
  queueController: QueueController
) => {
  const scopes = getFetchedScopes(queueController);
  return scopes.keycloakScopes.length > 0;
};

const gdprScopesExecutor = async (controller: QueueController) => {
  const { result } = getServiceConnectionsResultAndError(controller);
  if (!result) {
    return Promise.reject(new Error('No service connections fetched.'));
  }
  const scopesPerOidcType: ScopesPerOidcType = {
    pureKeyloakServices: [],
  };

  result.forEach(service => {
    const { gdprDeleteScope, gdprQueryScope } = service;
    const data = {
      gdprDeleteScope,
      gdprQueryScope,
    };

    scopesPerOidcType.pureKeyloakServices.push(data);
  });

  return Promise.resolve(scopesPerOidcType);
};

const getScopes = async (
  controller: QueueController,
  scopeType: 'gdprQueryScope' | 'gdprDeleteScope'
): Promise<ScopesPerType> => {
  const [error, scopes] = await to(gdprScopesExecutor(controller));
  if (error) {
    return Promise.reject(error);
  }
  if (!scopes) {
    return Promise.reject('No scopes fetched.');
  }
  const keycloakScopes = scopes.pureKeyloakServices.map(
    service => service[scopeType]
  );

  return Promise.resolve({ keycloakScopes });
};

const gdprQueryScopesExecutor: ActionExecutor = async (action, controller) =>
  getScopes(controller, 'gdprQueryScope');

const gdprDeleteScopesExecutor: ActionExecutor = async (action, controller) =>
  getScopes(controller, 'gdprDeleteScope');

export const getGdprQueryScopesAction: ActionProps = {
  type: gdprQueryScopesType,
  executor: gdprQueryScopesExecutor,
};

export const getGdprDeleteScopesAction: ActionProps = {
  type: gdprDeleteScopesType,
  executor: gdprDeleteScopesExecutor,
};
