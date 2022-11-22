import { useLazyQuery, ApolloError } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useRef } from 'react';

import { GdprServiceConnectionsRoot, Service } from '../graphql/typings';
import useAuthorizationCode from './useAuthorizationCode';
import { getDeleteScopes, getQueryScopes } from './utils';

const GDPR_SERVICE_CONNECTIONS = loader(
  './graphql/GdprServiceConnectionsQuery.graphql'
);

export type LoadStatus = {
  loading: boolean;
  authorizationCode?: string | null;
  complete: boolean;
  error?: ApolloError;
};

type Options = {
  requiredGdprScope: 'delete' | 'query';
  deferredAction: string;
  serviceName?: Service['name'];
  onError?: (e: ApolloError, status: LoadStatus) => void;
  onCompleted?: (authorizationCode: string, status: LoadStatus) => void;
};

function useServiceConnectionsAuthorizationCode(
  options: Options
): [() => void, LoadStatus] {
  // Using "useRef" instead of "useState", because "useState" is async
  // When calling updateStatus and then onCompleted(status) the status object would be old version.
  const loadStatusRef = useRef<LoadStatus>({
    loading: false,
    complete: false,
  });
  const updateStatus = (newProps: Partial<LoadStatus>) => {
    loadStatusRef.current = { ...loadStatusRef.current, ...newProps };
  };
  const [getAuthorizationCode] = useAuthorizationCode(
    options.deferredAction,
    authorizationCode => {
      if (!authorizationCode) {
        const error = new ApolloError({
          errorMessage: 'Authorization code not loaded',
        });
        updateStatus({
          error,
          loading: false,
        });

        if (options?.onError) {
          options.onError(error, loadStatusRef.current);
        }
      } else {
        updateStatus({
          complete: true,
          loading: false,
          authorizationCode,
        });
        if (options?.onCompleted) {
          options.onCompleted(authorizationCode, loadStatusRef.current);
        }
      }
    }
  );

  const [getServiceConnections] = useLazyQuery<GdprServiceConnectionsRoot>(
    GDPR_SERVICE_CONNECTIONS,
    {
      fetchPolicy: 'no-cache',
      onCompleted: data => {
        const scopes =
          options.requiredGdprScope === 'query'
            ? getQueryScopes(data, options.serviceName)
            : getDeleteScopes(data, options.serviceName);
        getAuthorizationCode(scopes);
      },
      onError: error => {
        updateStatus({
          error,
          loading: false,
        });
        if (options?.onError) {
          options.onError(error, loadStatusRef.current);
        }
      },
    }
  );

  return [
    () => {
      if (loadStatusRef.current.loading) {
        return;
      }
      updateStatus({
        loading: true,
        complete: false,
        authorizationCode: undefined,
        error: undefined,
      });
      getServiceConnections();
    },
    loadStatusRef.current,
  ];
}

export default useServiceConnectionsAuthorizationCode;
