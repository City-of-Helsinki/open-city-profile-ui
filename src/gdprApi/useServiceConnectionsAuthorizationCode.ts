import { useLazyQuery, ApolloError } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useState } from 'react';
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
  onError?: (e: ApolloError) => void;
  onCompleted?: (authorizationCode: string) => void;
};

function useServiceConnectionsAuthorizationCode(
  options: Options
): [() => void, LoadStatus] {
  const [status, setStatus] = useState<LoadStatus>({
    loading: false,
    complete: false,
  });
  const updateStatus = (newProps: Partial<LoadStatus>) => {
    setStatus(current => ({ ...current, ...newProps }));
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

  const [getServiceConnections] = useLazyQuery<ServiceConnectionsRoot>(
    SERVICE_CONNECTIONS,
    {
      fetchPolicy: 'no-cache',
      variables: createServiceConnectionsQueryVariables(i18n.language, true),
      onCompleted: data => {
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
