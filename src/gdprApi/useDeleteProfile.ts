import React, { useRef } from 'react';
import { useMutation, ApolloError } from '@apollo/client';
import { loader } from 'graphql.macro';

import {
  GdprDeleteMyProfileMutation,
  GdprDeleteMyProfileMutationVariables,
} from '../graphql/generatedTypes';
import useServiceConnectionsAuthorizationCode from './useServiceConnectionsAuthorizationCode';
import { ServiceConnectionData } from '../profile/helpers/getServiceConnectionData';
import { DeleteMyProfileResults } from '../graphql/typings';

const DELETE_PROFILE = loader('./graphql/GdprDeleteMyProfileMutation.graphql');

type QueryResult = {
  results?: DeleteMyProfileResults;
  error?: ApolloError;
};

export type DeleteProfileResult = {
  isDryRun: boolean;
  dryRunResult?: QueryResult;
  deleteResult?: QueryResult;
  serviceConnections?: ServiceConnectionData[];
};

type Options = {
  onDeleteCompleted: (result: QueryResult) => void;
  onDryRunCompleted: (result: QueryResult) => void;
  onError: (e: ApolloError | ApolloError['networkError']) => void;
};

function useDeleteProfile(
  options: Options
): [() => void, () => void, DeleteProfileResult, boolean] {
  const resultRef = useRef<DeleteProfileResult>({
    isDryRun: false,
  });
  const updateResultRef = ({
    data,
    error,
  }: {
    data?: GdprDeleteMyProfileMutation;
    error?: ApolloError;
  }) => {
    const { current } = resultRef;
    if (data) {
      const results = data.deleteMyProfile
        ? data.deleteMyProfile.results
        : undefined;
      if (current.isDryRun) {
        current.dryRunResult = {
          error: undefined,
          results,
        };
      } else {
        current.deleteResult = {
          error: undefined,
          results,
        };
      }
    }
    if (error) {
      if (current.isDryRun) {
        current.dryRunResult = {
          error,
        };
      } else {
        current.deleteResult = {
          error,
        };
      }
    }
  };
  const [deleteProfile, queryResult] = useMutation<
    GdprDeleteMyProfileMutation,
    GdprDeleteMyProfileMutationVariables
  >(DELETE_PROFILE, {
    fetchPolicy: 'no-cache',
    onCompleted: data => {
      updateResultRef({ data });
      if (resultRef.current.isDryRun) {
        options.onDryRunCompleted(
          resultRef.current.dryRunResult as QueryResult
        );
      } else {
        options.onDeleteCompleted(
          resultRef.current.deleteResult as QueryResult
        );
      }
    },
    onError: e => {
      updateResultRef({ error: e });
      if (options?.onError) {
        options.onError(e);
      }
    },
  });

  const handleAuthorizationCodeCallback = React.useCallback(
    (authorizationCode: string) => {
      const variablesWithAuthorizationCode = {
        input: {
          authorizationCode,
          dryRun: resultRef.current.isDryRun,
        },
      };
      deleteProfile({
        variables: variablesWithAuthorizationCode,
      });
    },
    [deleteProfile]
  );

  const [
    getAuthorizationCode,
    authorizationCodeStatus,
  ] = useServiceConnectionsAuthorizationCode({
    requiredGdprScope: 'delete',
    onCompleted: (e, status) => {
      resultRef.current.serviceConnections = status.serviceConnections;
      handleAuthorizationCodeCallback(e);
    },
    onError: e => {
      if (options?.onError) {
        options.onError(e);
      }
    },
  });

  const loading = authorizationCodeStatus.loading || queryResult.loading;
  const waitingForMutationStart =
    authorizationCodeStatus.complete && !queryResult.data && !queryResult.error;

  return [
    () => {
      resultRef.current.isDryRun = true;
      resultRef.current.dryRunResult = {};
      getAuthorizationCode();
    },
    () => {
      resultRef.current.isDryRun = false;
      resultRef.current.deleteResult = {};
      getAuthorizationCode();
    },
    resultRef.current,
    loading || waitingForMutationStart,
  ];
}

export default useDeleteProfile;
