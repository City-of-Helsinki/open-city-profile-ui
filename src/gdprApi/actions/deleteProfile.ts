import to from 'await-to-js';

import {
  ActionExecutor,
  ActionProps,
  QueueController,
  getData,
} from '../../common/actionQueue/actionQueue';
import graphqlClient from '../../graphql/client';
import {
  DeleteMyProfileMutationInput,
  GdprDeleteMyProfileMutation,
  GdprDeleteMyProfileMutationVariables,
  TranslationLanguage,
} from '../../graphql/generatedTypes';
import { Mutable } from '../../graphql/typings';
import { getActionResultAndErrorMessage } from './utils';
import {
  getStoredKeycloakAuthCode,
  getStoredTunnistamoAuthCode,
} from './authCodeParser';
import parseDeleteProfileResult, {
  DeleteResultLists,
} from '../../profile/helpers/parseDeleteProfileResult';
import { convertStringToTranslationLanguage } from '../../profile/helpers/createServiceConnectionsQueryVariables';
import reportErrorsToSentry from '../../common/sentry/reportErrorsToSentry';
import DELETE_PROFILE from '../graphql/GdprDeleteMyProfileMutation.graphql';

export const deleteProfileType = 'deleteProfile';

export const getDeleteProfileResult = (queueController: QueueController) =>
  getActionResultAndErrorMessage<DeleteResultLists>(
    deleteProfileType,
    queueController
  ).result;

const deleteProfileExecutor: ActionExecutor = async (
  action,
  queueController
) => {
  const authorizationCode = getStoredTunnistamoAuthCode(queueController);
  const authorizationCodeKeycloak = getStoredKeycloakAuthCode(queueController);
  if (!authorizationCode) {
    return Promise.reject('No tunnistamo authorization code');
  }
  const language = getData(action, 'language') as TranslationLanguage;
  const input: Mutable<DeleteMyProfileMutationInput> = {
    authorizationCode,
    dryRun: false,
  };
  if (typeof authorizationCodeKeycloak === 'string') {
    input.authorizationCodeKeycloak = authorizationCodeKeycloak;
  }
  const [error, result] = await to(
    graphqlClient.mutate<
      GdprDeleteMyProfileMutation,
      GdprDeleteMyProfileMutationVariables
    >({
      mutation: DELETE_PROFILE,
      fetchPolicy: 'no-cache',
      variables: {
        input,
        language,
      },
    })
  );
  if (error) {
    reportErrorsToSentry(error);
    return Promise.reject(error);
  }
  if (!result || !result.data) {
    return Promise.reject(new Error('Delete profile failed'));
  }

  return Promise.resolve(parseDeleteProfileResult(result.data));
};

export function createDeleteProfileAction(language: string): ActionProps {
  return {
    type: deleteProfileType,
    executor: deleteProfileExecutor,
    options: {
      noStorage: true,
      idleWhenActive: true,
    },
    data: {
      language: convertStringToTranslationLanguage(language),
    },
  };
}
