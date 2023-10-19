import { loader } from 'graphql.macro';
import to from 'await-to-js';

import {
  ActionExecutor,
  ActionProps,
  QueueController,
} from '../../common/actionQueue/actionQueue';
import graphqlClient from '../../graphql/client';
import {
  DownloadMyProfileQuery,
  DownloadMyProfileQueryVariables,
} from '../../graphql/generatedTypes';
import { Mutable } from '../../graphql/typings';
import { getActionResultAndErrorMessage } from './utils';
import {
  getStoredKeycloakAuthCode,
  getStoredTunnistamoAuthCode,
} from './authCodeParser';
import reportErrorsToSentry from '../../common/sentry/reportGraphQlErrors';

const DOWNLOAD_MY_PROFILE = loader(
  '../../profile/graphql/DownloadMyProfileQuery.graphql'
);

const downloadDataType = 'downloadData';

export const getDownloadDataResult = (queueController: QueueController) =>
  getActionResultAndErrorMessage<unknown>(downloadDataType, queueController)
    .result;

const getDownloadDataExecutor: ActionExecutor = async (
  action,
  queueController
) => {
  const authorizationCode = getStoredTunnistamoAuthCode(queueController);
  const authorizationCodeKeycloak = getStoredKeycloakAuthCode(queueController);
  if (!authorizationCode) {
    return Promise.reject('No tunnistamo authorization code');
  }
  const variables: Mutable<DownloadMyProfileQueryVariables> = {
    authorizationCode,
  };
  if (typeof authorizationCodeKeycloak === 'string') {
    variables.authorizationCodeKeycloak = authorizationCodeKeycloak;
  }
  const [error, result] = await to(
    graphqlClient.query<DownloadMyProfileQuery>({
      query: DOWNLOAD_MY_PROFILE,
      fetchPolicy: 'network-only',
      variables: {
        ...variables,
      },
    })
  );
  if (error) {
    reportErrorsToSentry(error);
    return Promise.reject(error);
  }
  if (!result || !result.data) {
    return Promise.reject(
      new Error("'No results in DOWNLOAD_MY_PROFILE query")
    );
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
