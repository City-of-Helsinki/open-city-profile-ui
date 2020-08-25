import React from 'react';
import {
  useQuery,
  useLazyQuery,
  LazyQueryHookOptions,
} from '@apollo/react-hooks';
import { QueryResult } from '@apollo/react-common';
import { DocumentNode } from 'graphql';
import { loader } from 'graphql.macro';

import { GdprServiceConnectionsQuery } from '../graphql/generatedTypes';
import { getQueryScopes } from './utils';
import useAuthorizationCode from './useAuthorizationCode';

const SERVICE_CONNECTIONS = loader(
  './graphql/GdprServiceConnectionsQuery.graphql'
);

type TVariables = Record<string, unknown>;

function useDownloadProfile<TQuery>(
  query: DocumentNode,
  options?: LazyQueryHookOptions<TQuery, TVariables>
): [() => void, QueryResult<TQuery, TVariables>] {
  const { data } = useQuery<GdprServiceConnectionsQuery>(SERVICE_CONNECTIONS);
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

  const handleDownloadActionInitialization = React.useCallback(() => {
    const queryScopes = getQueryScopes(data);

    startFetchingAuthorizationCode(queryScopes);
  }, [data, startFetchingAuthorizationCode]);

  const injectedQueryResult = {
    ...queryResult,
    loading: isAuthorizing || queryResult.loading,
  };

  return [handleDownloadActionInitialization, injectedQueryResult];
}

export default useDownloadProfile;
