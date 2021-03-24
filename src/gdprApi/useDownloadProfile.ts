import React from 'react';
import {
  useQuery,
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
  const { data } = useQuery<GdprServiceConnectionsRoot>(SERVICE_CONNECTIONS);
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

  return [
    handleDownloadActionInitialization,
    queryResult,
    isAuthorizing || queryResult.loading,
  ];
}

export default useDownloadProfile;
