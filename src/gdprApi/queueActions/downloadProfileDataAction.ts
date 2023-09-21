import { loader } from 'graphql.macro';
import to from 'await-to-js';

import graphqlClient from '../../graphql/client';
import {
  DownloadMyProfileQuery,
  DownloadMyProfileQueryVariables,
} from '../../graphql/generatedTypes';
import {
  ActionExecutor,
  ActionProps,
} from '../../common/actionQueue/actionQueue';
import { getTunnistamoAuthorizationCode } from './tunnistamoAuthorizationCodeHandlerAction';
import { getkeycloakAuthorizationCode } from './keycloakAuthorizationCodeHandlerAction';
import { Mutable } from '../../graphql/typings';

const DOWNLOAD_MY_PROFILE = loader(
  '../../profile/graphql/DownloadMyProfileQuery.graphql'
);

export const downloadProfileDataExecutor: ActionExecutor = async (
  action,
  queueFunctions
) =>
  new Promise((resolve, reject) => {
    (async () => {
      const authorizationCode = getTunnistamoAuthorizationCode(queueFunctions);
      const authorizationCodeKeycloak = getkeycloakAuthorizationCode(
        queueFunctions
      );
      const variables: Mutable<DownloadMyProfileQueryVariables> = {
        authorizationCode,
      };
      if (typeof authorizationCodeKeycloak === 'string') {
        variables.authorizationCodeKeycloak = authorizationCodeKeycloak;
      }
      console.log('variables', variables);
      //authorizationCodeKeycloak
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
        return reject(error);
      }
      if (!result || !result.data) {
        return reject(
          new Error("'No results in GDPR_SERVICE_CONNECTIONS query")
        );
      }
      return resolve(result.data.downloadMyProfile);
    })();
  });

const downloadProfileDataActionType = 'downloadProfileData';

export const downloadProfileDataAction: ActionProps = {
  type: downloadProfileDataActionType,
  executor: downloadProfileDataExecutor,
  options: {
    noStorage: true,
  },
};
