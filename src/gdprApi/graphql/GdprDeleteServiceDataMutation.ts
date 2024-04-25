import gql from 'graphql-tag';

export const DELETE_SERVICE_DATA = gql`
  fragment GdprDeleteMyServiceDataMutation on ServiceConnectionDeletionResult {
    success
    errors {
      code
    }
  }

  mutation GdprDeleteMyServiceData($input: DeleteMyServiceDataMutationInput!) {
    deleteMyServiceData(input: $input) {
      result {
        ...GdprDeleteMyServiceDataMutation
      }
    }
  }
`;
