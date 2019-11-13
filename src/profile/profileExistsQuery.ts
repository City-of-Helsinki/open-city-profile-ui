import { gql } from 'apollo-boost';

const PROFILE_EXISTS = gql`
  query ProfileQuery {
    profile {
      id
    }
  }
`;

export default PROFILE_EXISTS;
