import React from 'react';
import {
  useMutation,
  MutationHookOptions,
  MutationResult,
} from '@apollo/client';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';

import {
  GdprDeleteMyProfileMutation,
  GdprDeleteMyProfileMutationVariables,
} from '../graphql/generatedTypes';
import useServiceConnectionsAuthorizationCode from './useServiceConnectionsAuthorizationCode';
import createServiceConnectionsQueryVariables from '../profile/helpers/createServiceConnectionsQueryVariables';

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

  const { i18n } = useTranslation();

  const handleAuthorizationCodeCallback = React.useCallback(
    (authorizationCode: string | null) => {
      if (authorizationCode) {
        const authorizationCodeKeycloak = localStorage.getItem(
          'keycloak_gdpr_code'
        );
        const variablesWithAuthorizationCode = {
          input: {
            authorizationCode,
            authorizationCodeKeycloak,
          },
          ...createServiceConnectionsQueryVariables(i18n.language),
        };
        deleteProfile({
          variables: variablesWithAuthorizationCode,
        });
      }
    },
    [deleteProfile, i18n.language]
  );

  const [
    getAuthorizationCode,
    authorizationCodeStatus,
  ] = useServiceConnectionsAuthorizationCode({
    requiredGdprScope: 'delete',
    idp: 'tunnistamo',
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
