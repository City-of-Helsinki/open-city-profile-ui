import {
  GdprDeleteMyServiceDataMutation,
  GdprDeleteMyServiceDataMutation_deleteMyServiceData_result,
} from '../../graphql/generatedTypes';

export function getServiceConnectionDeleteResult(errorCodes?: string[]) {
  const success = !errorCodes;
  const errors: GdprDeleteMyServiceDataMutation_deleteMyServiceData_result['errors'] = errorCodes
    ? errorCodes.map(code => ({
        __typename: 'ServiceConnectionDeletionError',
        code,
      }))
    : [];
  return {
    deleteMyServiceData: {
      __typename: 'DeleteMyServiceDataMutationPayload',
      result: {
        __typename: 'ServiceConnectionDeletionResult',
        success,
        errors,
      },
    },
  } as GdprDeleteMyServiceDataMutation;
}
