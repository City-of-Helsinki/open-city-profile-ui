import React, { useRef } from 'react';
import { useMutation, ApolloError } from '@apollo/client';
import { loader } from 'graphql.macro';

import {
  GdprDeleteMyProfileMutation,
  GdprDeleteMyProfileMutationVariables,
} from '../graphql/generatedTypes';
import useServiceConnectionsAuthorizationCode from './useServiceConnectionsAuthorizationCode';
import { ServiceConnectionData } from '../profile/helpers/getServiceConnectionData';

const DELETE_PROFILE = loader('./graphql/GdprDeleteMyProfileMutation.graphql');

type Result = {
  loading: boolean;
  dryRun: boolean;
  dryRunResult?: GdprDeleteMyProfileMutation;
  dryRunFailures?: string[];
  dryRunError?: ApolloError['networkError'];
  deleteError?: ApolloError;
  deleteResult?: GdprDeleteMyProfileMutation;
  serviceConnections?: ServiceConnectionData[];
};

type Options = {
  onDeleteCompleted: (result?: GdprDeleteMyProfileMutation) => void;
  onDryRunCompleted: (
    result?: GdprDeleteMyProfileMutation,
    failures?: Result['dryRunFailures']
  ) => void;
  onError: (
    e: ApolloError | ApolloError['networkError'],
    wasDryRun: boolean
  ) => void;
};

function useDeleteProfile(options: Options): [() => void, () => void, Result] {
  const isDryRunRef = useRef<boolean>(false);
  const [deleteProfile, queryResult] = useMutation<
    GdprDeleteMyProfileMutation,
    GdprDeleteMyProfileMutationVariables
  >(DELETE_PROFILE, {
    fetchPolicy: 'no-cache',
    onCompleted: data => {
      console.log('onCompleted', data);
      if (isDryRunRef.current) {
        options.onDryRunCompleted(
          queryResult.data || undefined,
          queryResult.error
            ? queryResult.error.graphQLErrors.map(error => error.message)
            : undefined
        );
      } else if (options?.onDeleteCompleted) {
        options.onDeleteCompleted(data);
      }
    },
    onError: e => {
      if (options?.onError) {
        options.onError(e, isDryRunRef.current);
      }
    },
  });

  const handleAuthorizationCodeCallback = React.useCallback(
    (authorizationCode: string | null) => {
      if (authorizationCode) {
        const variablesWithAuthorizationCode = {
          input: {
            authorizationCode,
            dryRun: isDryRunRef.current,
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
    onCompleted: e => {
      handleAuthorizationCodeCallback(e);
    },
    onError: e => {
      if (options?.onError) {
        options.onError(e, isDryRunRef.current);
      }
    },
  });

  const loading = authorizationCodeStatus.loading || queryResult.loading;
  const waitingForMutationStart =
    authorizationCodeStatus.complete && !queryResult.data && !queryResult.error;
  const dryRunResult =
    isDryRunRef.current && !loading
      ? {
          error: queryResult.error,
          result: queryResult.data,
        }
      : {};

  const deleteResult =
    !isDryRunRef.current && !loading
      ? {
          error: queryResult.error,
          result: queryResult.data,
        }
      : {};

  const result: Result = {
    dryRun: isDryRunRef.current,
    dryRunFailures: dryRunResult.error
      ? dryRunResult.error.graphQLErrors.map(error => error.message)
      : undefined,
    dryRunError: dryRunResult.error
      ? dryRunResult.error.networkError
      : undefined,
    dryRunResult: dryRunResult.result || undefined,
    deleteError: deleteResult.error || undefined,
    deleteResult: deleteResult.result || undefined,
    loading: loading || waitingForMutationStart,
    serviceConnections: authorizationCodeStatus.serviceConnections,
  };

  return [
    () => {
      console.log('dry run');
      isDryRunRef.current = true;
      getAuthorizationCode();
    },
    () => {
      isDryRunRef.current = false;
      getAuthorizationCode();
    },
    result,
  ];
}

export default useDeleteProfile;
