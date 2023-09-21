import { loader } from 'graphql.macro';
import to from 'await-to-js';

import graphqlClient from '../graphql/client';
import {
  GdprServiceConnectionService,
  GdprServiceConnectionsRoot,
} from '../graphql/typings';
import { getServiceConnectionsServices } from './utils';
import { ActionExecutor, ActionProps } from './useActionQueue';

const GDPR_SERVICE_CONNECTIONS = loader(
  './graphql/GdprServiceConnectionsQuery.graphql'
);

export const serviceConnectionsQueryExecutor: ActionExecutor = async () =>
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

const gdprQueryScopesActionType = 'gdprQueryScopes';

export const gdprScopesExecutor: ActionExecutor = async (action, queue) =>
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
      console.log('action', { ...action });
      const scope =
        action.type === gdprQueryScopesActionType
          ? 'gdprQueryScope'
          : 'gdprDeleteScope';
      return resolve(result.map(service => service[scope]));
    })();
  });

export const gdprQueryScopeGetterAction: ActionProps = {
  type: gdprQueryScopesActionType,
  executor: gdprScopesExecutor,
};
