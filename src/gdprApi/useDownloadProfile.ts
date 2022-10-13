import React from 'react';
import {
  useLazyQuery,
  LazyQueryHookOptions,
  LazyQueryResult,
} from '@apollo/client';
import { DocumentNode } from 'graphql';
import { loader } from 'graphql.macro';

import { GdprServiceConnectionsRoot } from '../graphql/typings';
import useAuthorizationCodeIFrame from './useAuthorizationCodeIFrame';
import { getQueryScopes } from './utils';

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

  const [
    getAuthorizationCode,
    isFetchingAuthorizationCode,
  ] = useAuthorizationCodeIFrame(e => {
    handleAuthorizationCodeCallback(e);
  });

  const [getServiceConnections] = useLazyQuery<GdprServiceConnectionsRoot>(
    SERVICE_CONNECTIONS,
    {
      onCompleted: data => {
        const queryScopes = getQueryScopes(data);
        getAuthorizationCode(queryScopes);
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
    isFetchingAuthorizationCode || queryResult.loading,
  ];
}

export default useDownloadProfile;
