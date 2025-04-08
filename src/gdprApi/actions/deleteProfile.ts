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
import { getStoredKeycloakAuthCode } from './authCodeParser';
import parseDeleteProfileResult, {
  DeleteResultLists,
} from '../../profile/helpers/parseDeleteProfileResult';
import { convertStringToTranslationLanguage } from '../../profile/helpers/createServiceConnectionsQueryVariables';
import reportErrorsToSentry from '../../common/sentry/reportErrorsToSentry';
import { DELETE_PROFILE } from '../graphql/GdprDeleteMyProfileMutation';
import parseGraphQLError from '../../profile/helpers/parseGraphQLError';

export const deleteProfileType = 'deleteProfile';

type DeleteProfileResult = keyof typeof resultTypes;

const resultTypes = {
  insufficientLoa: 'insufficientLoa',
} as const;

export const getDeleteProfileResultOrError = (
  queueController: QueueController
) =>
  getActionResultAndErrorMessage<DeleteResultLists | DeleteProfileResult>(
    deleteProfileType,
    queueController
  );

export const isInsufficientLoaResult = (
  resultOrError: ReturnType<typeof getDeleteProfileResultOrError>
) => resultOrError.errorMessage === resultTypes.insufficientLoa;

const deleteProfileExecutor: ActionExecutor = async (
  action,
  queueController
) => {
  const authorizationCode = getStoredKeycloakAuthCode(queueController);

  if (!authorizationCode) {
    return Promise.reject('No keycloak authorization code for delete profile');
  }

  const language = getData(action, 'language') as TranslationLanguage;
  const input: Mutable<DeleteMyProfileMutationInput> = {
    authorizationCode,
    dryRun: false,
  };

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
    if (
      !parseGraphQLError(error).isInsufficientLoaError &&
      !parseGraphQLError(error).isAllowedError
    ) {
      reportErrorsToSentry(error);
    }

    if (parseGraphQLError(error).isInsufficientLoaError) {
      return Promise.reject(resultTypes.insufficientLoa);
    }

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
