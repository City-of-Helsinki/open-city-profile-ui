import { loader } from 'graphql.macro';
import to from 'await-to-js';

import graphqlClient from '../../graphql/client';
import { DownloadMyProfileQuery } from '../../graphql/generatedTypes';
import {
  ActionExecutor,
  ActionProps,
} from '../../common/actionQueue/actionQueue';

const DOWNLOAD_MY_PROFILE = loader(
  '../../profile/graphql/DownloadMyProfileQuery.graphql'
);

export const downloadProfileDataExecutor: ActionExecutor = async (
  action,
  queueFunctions
) =>
  new Promise((resolve, reject) => {
    (async () => {
      const authorizationCode = queueFunctions.getResult('consumeCode');
      //authorizationCodeKeycloak
      const [error, result] = await to(
        graphqlClient.query<DownloadMyProfileQuery>({
          query: DOWNLOAD_MY_PROFILE,
          fetchPolicy: 'network-only',
          variables: {
            authorizationCode,
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
