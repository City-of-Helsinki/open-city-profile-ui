import React from 'react';
import {
  useLazyQuery,
  LazyQueryHookOptions,
  LazyQueryResult,
} from '@apollo/client';
import { DocumentNode } from 'graphql';
import { loader } from 'graphql.macro';

import { GdprServiceConnectionsRoot } from '../graphql/typings';
import { getQueryScopes } from './utils';
import useAuthorizationCode from './useAuthorizationCode';

const SERVICE_CONNECTIONS = loader(
  './graphql/GdprServiceConnectionsQuery.graphql'
);

type TVariables = Record<string, unknown>;

function useDownloadProfile<TQuery>(
  query: DocumentNode,
  options?: LazyQueryHookOptions<TQuery, TVariables>
): [() => void, LazyQueryResult<TQuery, TVariables>, boolean] {
  const [downloadProfile, queryResult] = useLazyQuery<TQuery>(query, {
    ...options,
    onCompleted: (...args) => {
      if (options?.onCompleted) {
        options.onCompleted(...args);
      }
    },
  });

  const handleAuthorizationCodeCallback = React.useCallback(
    (authorizationCode: string | null) => {
      if (authorizationCode) {
        const variablesWithAuthorizationCode = {
          authorizationCode,
        };

        downloadProfile({
          variables: variablesWithAuthorizationCode,
        });
      }
    },
    [downloadProfile]
  );

  const [startFetchingAuthorizationCode, isAuthorizing] = useAuthorizationCode(
    'useDownloadProfile',
    handleAuthorizationCodeCallback
  );

  const handleDownloadActionInitialization = React.useCallback(
    serviceConnectionsResult => {
      const queryScopes = getQueryScopes(serviceConnectionsResult);

      startFetchingAuthorizationCode(queryScopes);
    },
    [startFetchingAuthorizationCode]
  );

  const [getServiceConnections] = useLazyQuery<GdprServiceConnectionsRoot>(
    SERVICE_CONNECTIONS,
    {
      onCompleted: data => {
        handleDownloadActionInitialization(data);
      },
      onError: error => {
        if (options?.onError) {
          options.onError(error);
        }
      },
    }
  );

  return [
    getServiceConnections,
    queryResult,
    isAuthorizing || queryResult.loading,
  ];
}

export default useDownloadProfile;
