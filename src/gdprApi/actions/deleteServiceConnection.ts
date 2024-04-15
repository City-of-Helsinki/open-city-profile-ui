import to from 'await-to-js';

import {
  ActionExecutor,
  ActionProps,
  QueueController,
  getData,
} from '../../common/actionQueue/actionQueue';
import graphqlClient from '../../graphql/client';
import {
  DeleteMyServiceDataMutationInput,
  GdprDeleteMyServiceDataMutation,
  GdprDeleteMyServiceDataMutationVariables,
} from '../../graphql/generatedTypes';
import { Mutable } from '../../graphql/typings';
import { getActionResultAndErrorMessage } from './utils';
import {
  getStoredKeycloakAuthCode,
  getStoredTunnistamoAuthCode,
} from './authCodeParser';
import reportErrorsToSentry from '../../common/sentry/reportErrorsToSentry';
import DELETE_SERVICE_DATA from '../graphql/GdprDeleteServiceDataMutation.graphql';
import parseGraphQLError from '../../profile/helpers/parseGraphQLError';

export const deleteServiceConnectionType = 'deleteServiceConnection';

type DeleteServiceConnectionResult = keyof typeof resultTypes;

const resultTypes = {
  success: 'success',
  forbidden: 'forbidden',
  queryError: 'queryError',
  noAuthCodes: 'noAuthCodes',
  insufficientLoa: 'insufficientLoa',
} as const;

export const getDeleteServiceConnectionResultOrError = (
  queueController: QueueController
) =>
  getActionResultAndErrorMessage<DeleteServiceConnectionResult>(
    deleteServiceConnectionType,
    queueController
  );

export const isForbiddenResult = (
  resultOrError: ReturnType<typeof getDeleteServiceConnectionResultOrError>
) => resultOrError.errorMessage === resultTypes.forbidden;

export const isInsufficientLoaResult = (
  resultOrError: ReturnType<typeof getDeleteServiceConnectionResultOrError>
) => resultOrError.errorMessage === resultTypes.insufficientLoa;

export const isSuccessResult = (
  resultOrError: ReturnType<typeof getDeleteServiceConnectionResultOrError>
) => resultOrError.result === resultTypes.success;

const deleteServiceConnectionExecutor: ActionExecutor = async (
  action,
  queueController
) => {
  const authorizationCode = getStoredTunnistamoAuthCode(queueController);
  const authorizationCodeKeycloak = getStoredKeycloakAuthCode(queueController);
  if (!authorizationCode) {
    return Promise.reject(resultTypes.noAuthCodes);
  }
  const serviceName = getData(action, 'serviceName') as string;
  const input: Mutable<DeleteMyServiceDataMutationInput> = {
    authorizationCode,
    serviceName,
    dryRun: false,
  };
  if (typeof authorizationCodeKeycloak === 'string') {
    input.authorizationCodeKeycloak = authorizationCodeKeycloak;
  }
  const [error, result] = await to(
    graphqlClient.mutate<
      GdprDeleteMyServiceDataMutation,
      GdprDeleteMyServiceDataMutationVariables
    >({
      mutation: DELETE_SERVICE_DATA,
      fetchPolicy: 'no-cache',
      variables: {
        input,
      },
    })
  );

  if (error) {
    reportErrorsToSentry(error);

    if (parseGraphQLError(error).isInsufficientLoaError) {
      return Promise.reject(resultTypes.insufficientLoa);
    }

    return Promise.reject(resultTypes.queryError);
  }

  if (!result || !result.data) {
    return Promise.reject(resultTypes.queryError);
  }
  if (!result.data.deleteMyServiceData?.result.success) {
    return Promise.reject(resultTypes.forbidden);
  }
  return Promise.resolve(resultTypes.success);
};

export function createDeleteServiceConnectionAction(
  serviceName: string
): ActionProps {
  return {
    type: deleteServiceConnectionType,
    executor: deleteServiceConnectionExecutor,
    options: {
      noStorage: true,
      idleWhenActive: true,
    },
    data: {
      serviceName,
    },
  };
}
