import to from 'await-to-js';

import { ActionExecutor, ActionProps, QueueController } from '../../common/actionQueue/actionQueue';
import graphqlClient from '../../graphql/client';
import { DownloadMyProfileQuery, DownloadMyProfileQueryVariables } from '../../graphql/generatedTypes';
import { Mutable } from '../../graphql/typings';
import { getActionResultAndErrorMessage } from './utils';
import { getStoredKeycloakAuthCode } from './authCodeParser';
import reportErrorsToSentry from '../../common/sentry/reportErrorsToSentry';
import { DOWNLOAD_MY_PROFILE } from '../../profile/graphql/DownloadMyProfileQuery';
import parseGraphQLError from '../../profile/helpers/parseGraphQLError';

const downloadDataType = 'downloadData';

type DownloadDataResult = keyof typeof resultTypes;

const resultTypes = {
  insufficientLoa: 'insufficientLoa',
} as const;

export const getDownloadDataResultOrError = (queueController: QueueController) =>
  getActionResultAndErrorMessage<DownloadDataResult | unknown>(downloadDataType, queueController);

export const isInsufficientLoaResult = (resultOrError: ReturnType<typeof getDownloadDataResultOrError>) =>
  resultOrError.errorMessage === resultTypes.insufficientLoa;

const getDownloadDataExecutor: ActionExecutor = async (action, queueController) => {
  const authorizationCode = getStoredKeycloakAuthCode(queueController);

  if (!authorizationCode) {
    return Promise.reject('No keycloak authorization code for download');
  }
  const variables: Mutable<DownloadMyProfileQueryVariables> = {
    authorizationCode,
  };

  const [error, result] = await to(
    graphqlClient.query<DownloadMyProfileQuery>({
      query: DOWNLOAD_MY_PROFILE,
      fetchPolicy: 'network-only',
      variables: {
        ...variables,
      },
    }),
  );
  if (error) {
    if (!parseGraphQLError(error).isInsufficientLoaError && !parseGraphQLError(error).isAllowedError) {
      reportErrorsToSentry(error);
    }

    if (parseGraphQLError(error).isInsufficientLoaError) {
      return Promise.reject(resultTypes.insufficientLoa);
    }

    return Promise.reject(error);
  }
  if (!result || !result.data) {
    return Promise.reject(new Error("'No results in DOWNLOAD_MY_PROFILE query"));
  }
  return Promise.resolve(result.data.downloadMyProfile);
};

export const getDownloadDataAction: ActionProps = {
  type: downloadDataType,
  executor: getDownloadDataExecutor,
  options: {
    noStorage: true,
    idleWhenActive: true,
  },
};
