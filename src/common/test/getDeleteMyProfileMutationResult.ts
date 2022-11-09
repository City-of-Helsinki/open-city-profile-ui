import { getServiceConnectionsServices } from '../../gdprApi/utils';
import {
  GdprDeleteMyProfileMutation,
  GdprDeleteMyProfileMutation_deleteMyProfile_results,
  GdprDeleteMyProfileMutation_deleteMyProfile_results_errors,
} from '../../graphql/generatedTypes';
import { Service } from '../../graphql/typings';
import getMyProfileWithServiceConnections from './getMyProfileWithServiceConnections';

export function getDeleteMyProfileMutationResult(errorCodes?: string[]) {
  const mockServices = getServiceConnectionsServices<Service>(
    getMyProfileWithServiceConnections()
  );
  const results: GdprDeleteMyProfileMutation_deleteMyProfile_results[] = mockServices.map(
    (service, index) => {
      const errors =
        errorCodes && errorCodes[index]
          ? ([
              {
                __typename: 'ServiceConnectionDeletionError',
                code: errorCodes[index],
              },
            ] as GdprDeleteMyProfileMutation_deleteMyProfile_results_errors[])
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
