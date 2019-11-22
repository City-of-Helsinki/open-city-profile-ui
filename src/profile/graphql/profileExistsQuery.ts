import { gql } from 'apollo-boost';

const PROFILE_EXISTS = gql`
  query ProfileExistsQuery {
    myProfile {
      id
    }
  }
`;

export default PROFILE_EXISTS;
