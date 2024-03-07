import { getServiceConnectionsServices } from '../../gdprApi/utils';
import {
  GdprDeleteMyProfileMutation,
  GdprDeleteMyProfileMutationDeleteMyProfileResultsFragment,
  GdprDeleteMyProfileMutationDeleteMyProfileResultsErrorsFragment,
} from '../../graphql/generatedTypes';
import { Service } from '../../graphql/typings';
import getMyProfileWithServiceConnections from './getMyProfileWithServiceConnections';

export function getDeleteMyProfileMutationResult(errorCodes?: string[]) {
  const mockServices = getServiceConnectionsServices<Service>(
    getMyProfileWithServiceConnections()
  );
  const results: GdprDeleteMyProfileMutationDeleteMyProfileResultsFragment[] = mockServices.map(
    (service, index) => {
      const errors =
        errorCodes && errorCodes[index]
          ? ([
              {
                __typename: 'ServiceConnectionDeletionError',
                code: errorCodes[index],
              },
            ] as GdprDeleteMyProfileMutationDeleteMyProfileResultsErrorsFragment[])
          : [];
      return {
        __typename: 'ServiceConnectionDeletionResult',
        success: !(errors && errors.length),
        errors,
        service: {
          ...service,
        },
      };
    }
  );
  return {
    deleteMyProfile: {
      __typename: 'DeleteMyProfileMutationPayload',
      results,
    },
  } as GdprDeleteMyProfileMutation;
}
