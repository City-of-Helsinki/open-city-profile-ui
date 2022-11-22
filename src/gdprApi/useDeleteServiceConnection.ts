import { useCallback } from 'react';
import { MutationHookOptions, useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';

import useServiceConnectionsAuthorizationCode from './useServiceConnectionsAuthorizationCode';
import {
  GdprDeleteMyServiceDataMutationVariables,
  GdprDeleteMyServiceDataMutation,
} from '../graphql/generatedTypes';

const DELETE_SERVICE_DATA = loader('./graphql/GdprDeleteServiceData.graphql');

type ReturnTuple = [
  () => void,
  { hasCode: boolean; isDeleting: boolean; isLoading: boolean }
];

function useDeleteServiceConnection(
  serviceName: string,
  options: MutationHookOptions<
    GdprDeleteMyServiceDataMutation,
    GdprDeleteMyServiceDataMutationVariables
  >
): ReturnTuple {
  const [deleteServiceData, queryResult] = useMutation<
    GdprDeleteMyServiceDataMutation,
    GdprDeleteMyServiceDataMutationVariables
  >(DELETE_SERVICE_DATA, {
    ...options,
  });

  const executeDeletion = useCallback(
    (authorizationCode: string) => {
      const variablesWithAuthorizationCode = {
        input: {
          authorizationCode,
          serviceName,
          dryRun: false,
        },
      };

      deleteServiceData({
        variables: variablesWithAuthorizationCode,
      });
    },
    [deleteServiceData, serviceName]
  );

  const [
    getAuthorizationCode,
    authorizationCodeStatus,
  ] = useServiceConnectionsAuthorizationCode({
    serviceName,
    requiredGdprScope: 'delete',
    deferredAction: `useDeleteServiceConnection-${serviceName}`,
    onCompleted: e => {
      executeDeletion(e);
    },
    onError: options?.onError,
  });

  return [
    getAuthorizationCode,
    {
      hasCode: !!authorizationCodeStatus.authorizationCode,
      isLoading: queryResult.loading || authorizationCodeStatus.loading,
      isDeleting: queryResult.loading,
    },
  ];
}

export default useDeleteServiceConnection;
