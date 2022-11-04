import React from 'react';
import {
  useMutation,
  MutationHookOptions,
  MutationResult,
} from '@apollo/client';
import { loader } from 'graphql.macro';

import {
  GdprDeleteMyProfileMutation,
  GdprDeleteMyProfileMutationVariables,
} from '../graphql/generatedTypes';
import useServiceConnectionsAuthorizationCode from './useServiceConnectionsAuthorizationCode';

const DELETE_PROFILE = loader('./graphql/GdprDeleteMyProfileMutation.graphql');

function useDeleteProfile(
  options: MutationHookOptions<
    GdprDeleteMyProfileMutation,
    GdprDeleteMyProfileMutationVariables
  >
): [() => void, MutationResult<GdprDeleteMyProfileMutation>] {
  const [deleteProfile, queryResult] = useMutation<
    GdprDeleteMyProfileMutation,
    GdprDeleteMyProfileMutationVariables
  >(DELETE_PROFILE, options);

  const handleAuthorizationCodeCallback = React.useCallback(
    (authorizationCode: string | null) => {
      if (authorizationCode) {
        const variablesWithAuthorizationCode = {
          input: {
            authorizationCode,
          },
        };
        deleteProfile({
          variables: variablesWithAuthorizationCode,
        });
      }
    },
    [deleteProfile]
  );

  const [
    getAuthorizationCode,
    authorizationCodeStatus,
  ] = useServiceConnectionsAuthorizationCode({
    requiredGdprScope: 'delete',
    deferredAction: 'useDeleteProfile',
    onCompleted: e => {
      handleAuthorizationCodeCallback(e);
    },
    onError: options?.onError,
  });

  const injectedMutationResult = {
    ...queryResult,
    loading: authorizationCodeStatus.loading || queryResult.loading,
  };

  return [getAuthorizationCode, injectedMutationResult];
}

export default useDeleteProfile;
