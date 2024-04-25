import gql from 'graphql-tag';

export const NAME = gql`
  query Name {
    myProfile {
      firstName
      lastName
      nickname
    }
  }
`;
