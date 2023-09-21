import { loader } from 'graphql.macro';
import to from 'await-to-js';

import graphqlClient from '../../graphql/client';
import {
  GdprServiceConnectionService,
  GdprServiceConnectionsRoot,
} from '../../graphql/typings';
import { getServiceConnectionsServices } from '../utils';
import {
  ActionExecutor,
  ActionProps,
  QueueFunctions,
} from '../../common/actionQueue/actionQueue';

const GDPR_SERVICE_CONNECTIONS = loader(
  '../graphql/GdprServiceConnectionsQuery.graphql'
);

export type ScopesPerOidcType = {
  pureKeyloakServices: string[];
  tunnistamoServices: string[];
};

const gdprQueryScopesActionType = 'gdprQueryScopes';

export const requiresKeycloakAuthorizationCode = (
  serviceScopes: ScopesPerOidcType
): boolean => serviceScopes.pureKeyloakServices.length > 0;

export const requiresTunnistamoAuthorizationCode = (
  serviceScopes: ScopesPerOidcType
): boolean => serviceScopes.tunnistamoServices.length > 0;

export const getScopesFromQueue = (
  queueFunctions: QueueFunctions
): ScopesPerOidcType => {
  const result = queueFunctions.getResult(gdprQueryScopesActionType) as
    | ScopesPerOidcType
    | undefined;
  return (
    result || {
      pureKeyloakServices: [],
      tunnistamoServices: [],
    }
  );
};

const serviceConnectionsQueryExecutor: ActionExecutor = async () =>
  new Promise((resolve, reject) => {
    (async () => {
      const [error, result] = await to(
        graphqlClient.query<GdprServiceConnectionsRoot>({
          query: GDPR_SERVICE_CONNECTIONS,
          fetchPolicy: 'no-cache',
        })
      );
      if (error) {
        return reject(error);
      }
      if (!result || !result.data) {
        return reject(
          new Error("'No results in GDPR_SERVICE_CONNECTIONS query")
        );
      }
      return resolve(getServiceConnectionsServices(result.data));
    })();
  });

const gdprScopesExecutor: ActionExecutor = async (action, queue) =>
  new Promise((resolve, reject) => {
    (async () => {
      const [error, result] = await to(
        serviceConnectionsQueryExecutor(action, queue) as Promise<
          GdprServiceConnectionService[]
        >
      );
      if (error) {
        return reject(error);
      }
      if (!result || !result.length) {
        return reject(
          new Error(
            "'No services returned from serviceConnectionsQueryExecutor"
          )
        );
      }
      const scopePropName =
        action.type === gdprQueryScopesActionType
          ? 'gdprQueryScope'
          : 'gdprDeleteScope';

      const scopesPerOidcType: ScopesPerOidcType = {
        pureKeyloakServices: [],
        tunnistamoServices: [],
      };

      result.forEach(service => {
        const value = service[scopePropName];
        if (service.isPureKeycloak) {
          scopesPerOidcType.pureKeyloakServices.push(value);
        } else {
          scopesPerOidcType.tunnistamoServices.push(value);
        }
      });
      console.log('scopesPerOidcType', scopesPerOidcType);
      console.log(
        'requiresKeycloakAuthorizationCode',
        requiresKeycloakAuthorizationCode(scopesPerOidcType)
      );
      console.log(
        'requiresTunnistamoAuthorizationCode',
        requiresTunnistamoAuthorizationCode(scopesPerOidcType)
      );
      return resolve(scopesPerOidcType);
    })();
  });

export const gdprQueryScopeGetterAction: ActionProps = {
  type: gdprQueryScopesActionType,
  executor: gdprScopesExecutor,
};
