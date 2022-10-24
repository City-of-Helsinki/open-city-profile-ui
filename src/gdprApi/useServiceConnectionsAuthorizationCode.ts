import { useLazyQuery, ApolloError } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ServiceConnectionsRoot } from '../graphql/typings';
import createServiceConnectionsQueryVariables from '../profile/helpers/createServiceConnectionsQueryVariables';
import getServiceConnectionData, {
  ServiceConnectionData,
} from '../profile/helpers/getServiceConnectionData';
import useAuthorizationCodeIFrame from './useAuthorizationCodeIFrame';
import { getDeleteScopes, getQueryScopes } from './utils';

const SERVICE_CONNECTIONS = loader(
  '../profile/graphql/ServiceConnectionsQuery.graphql'
);

export type LoadStatus = {
  loading: boolean;
  authorizationCode?: string | null | undefined;
  serviceConnections?: ServiceConnectionData[];
  complete: boolean;
  error?: ApolloError;
};

type Options = {
  requiredGdprScope: 'delete' | 'query';
  onError?: (e: ApolloError, status: LoadStatus) => void;
  onCompleted?: (authorizationCode: string, status: LoadStatus) => void;
};

function useServiceConnectionsAuthorizationCode(
  options: Options
): [() => void, LoadStatus] {
  const loadStatusRef = useRef<LoadStatus>({
    loading: false,
    complete: false,
  });
  const updateStatus = (newProps: Partial<LoadStatus>) => {
    loadStatusRef.current = { ...loadStatusRef.current, ...newProps };
  };
  const { i18n } = useTranslation();
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
        options.onError(error, loadStatusRef.current);
      }
    } else {
      updateStatus({
        complete: true,
        loading: false,
        authorizationCode: e,
      });
      if (options?.onCompleted) {
        options.onCompleted(e, loadStatusRef.current);
      }
    }
  });

  const [getServiceConnections] = useLazyQuery<ServiceConnectionsRoot>(
    SERVICE_CONNECTIONS,
    {
      fetchPolicy: 'no-cache',
      variables: createServiceConnectionsQueryVariables(i18n.language, true),
      onCompleted: data => {
        // when language is changed, onCompleted is triggered if load is complete.
        // without next check the modal would be shown again after cancellation
        if (loadStatusRef.current.serviceConnections) {
          return;
        }
        updateStatus({ serviceConnections: getServiceConnectionData(data) });
        const scopes =
          options.requiredGdprScope === 'query'
            ? getQueryScopes(data)
            : getDeleteScopes(data);
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
        serviceConnections: undefined,
        error: undefined,
      });
      getServiceConnections();
    },
    loadStatusRef.current,
  ];
}

export default useServiceConnectionsAuthorizationCode;
