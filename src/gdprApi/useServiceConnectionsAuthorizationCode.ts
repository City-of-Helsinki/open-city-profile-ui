import { useLazyQuery, ApolloError } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useState } from 'react';

import { GdprServiceConnectionsRoot } from '../graphql/typings';
import useAuthorizationCodeIFrame from './useAuthorizationCodeIFrame';
import { getQueryScopes } from './utils';

const SERVICE_CONNECTIONS = loader(
  './graphql/GdprServiceConnectionsQuery.graphql'
);

export type LoadStatus = {
  loading: boolean;
  authorizationCode?: string | null | undefined;
  complete: boolean;
  error?: ApolloError;
};

type Options = {
  onError?: (e: ApolloError) => void;
  onCompleted?: (authorizationCode: string) => void;
};

function useServiceConnectionsAuthorizationCode(
  options?: Options
): [() => void, LoadStatus] {
  const [status, setStatus] = useState<LoadStatus>({
    loading: false,
    complete: false,
  });
  const updateStatus = (newProps: Partial<LoadStatus>) => {
    setStatus(current => ({ ...current, ...newProps }));
  };

  const [getAuthorizationCode] = useAuthorizationCodeIFrame(e => {
    if (!e) {
      const error = new ApolloError({
        errorMessage: 'Authorization code not loaded',
      });
      updateStatus({
        error,
        loading: false,
      });

      if (options?.onError) {
        options.onError(error);
      }
    } else {
      updateStatus({
        complete: true,
        loading: false,
        authorizationCode: e,
      });
      if (options?.onCompleted) {
        options.onCompleted(e);
      }
    }
  });

  const [getServiceConnections] = useLazyQuery<GdprServiceConnectionsRoot>(
    SERVICE_CONNECTIONS,
    {
      fetchPolicy: 'no-cache',
      onCompleted: data => {
        const queryScopes = getQueryScopes(data);
        getAuthorizationCode(queryScopes);
      },
      onError: error => {
        updateStatus({
          error,
          loading: false,
        });
        if (options?.onError) {
          options.onError(error);
        }
      },
    }
  );

  return [
    () => {
      if (status.loading || status.complete) {
        return;
      }
      updateStatus({
        loading: true,
      });
      getServiceConnections();
    },
    status,
  ];
}

export default useServiceConnectionsAuthorizationCode;
