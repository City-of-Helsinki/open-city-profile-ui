import { gql } from 'apollo-boost';

const CREATE_PROFILE = gql`
  mutation CreateProfile($profile: ProfileInput!) {
    updateProfile(profile: $profile) {
      profile {
        id
      }
    }
  }
`;

export default CREATE_PROFILE;
