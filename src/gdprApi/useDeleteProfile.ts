import React from 'react';
import {
  useQuery,
  useMutation,
  MutationHookOptions,
  MutationResult,
} from '@apollo/client';
import { loader } from 'graphql.macro';

import {
  GdprDeleteMyProfileMutation,
  GdprDeleteMyProfileMutationVariables,
} from '../graphql/generatedTypes';
import { GdprServiceConnectionsRoot } from '../graphql/typings';
import { getDeleteScopes } from './utils';
import useAuthorizationCode from './useAuthorizationCode';

const DELETE_PROFILE = loader('./graphql/GdprDeleteMyProfileMutation.graphql');
const SERVICE_CONNECTIONS = loader(
  './graphql/GdprServiceConnectionsQuery.graphql'
);

function useDeleteProfile(
  options: MutationHookOptions<
    GdprDeleteMyProfileMutation,
    GdprDeleteMyProfileMutationVariables
  >
): [() => void, MutationResult<GdprDeleteMyProfileMutation>] {
  const { data } = useQuery<GdprServiceConnectionsRoot>(SERVICE_CONNECTIONS);
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

  const [startFetchingAuthorizationCode, isAuthorizing] = useAuthorizationCode(
    'useDeleteProfile',
    handleAuthorizationCodeCallback
  );

  const handleDownloadActionInitialization = React.useCallback(() => {
    const deleteScopes = getDeleteScopes(data);

    startFetchingAuthorizationCode(deleteScopes);
  }, [data, startFetchingAuthorizationCode]);

  const injectedMutationResult = {
    ...queryResult,
    loading: isAuthorizing || queryResult.loading,
  };

  return [handleDownloadActionInitialization, injectedMutationResult];
}

export default useDeleteProfile;
