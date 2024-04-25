import gql from 'graphql-tag';

export const CREATE_PROFILE = gql`
  mutation CreateMyProfile($input: CreateMyProfileMutationInput!) {
    createMyProfile(input: $input) {
      profile {
        id
      }
    }
  }
`;
