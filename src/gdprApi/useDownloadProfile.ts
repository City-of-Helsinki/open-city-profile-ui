import React from 'react';
import {
  useLazyQuery,
  LazyQueryHookOptions,
  LazyQueryResult,
} from '@apollo/client';
import { DocumentNode } from 'graphql';

import useServiceConnectionsAuthorizationCode from './useServiceConnectionsAuthorizationCode';

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
    authorizationCodeStatus,
  ] = useServiceConnectionsAuthorizationCode({
    requiredGdprScope: 'query',
    deferredAction: 'useDownloadProfile',
    onCompleted: e => {
      handleAuthorizationCodeCallback(e);
    },
    onError: options?.onError,
  });

  return [
    getAuthorizationCode,
    queryResult,
    authorizationCodeStatus.loading || queryResult.loading,
  ];
}

export default useDownloadProfile;
