import gql from 'graphql-tag';

export const UPDATE_PROFILE = gql`
  fragment UpdateMyProfileMutation on ProfileNode {
    id
    firstName
    lastName
    nickname
    language
    primaryAddress {
      id
      primary
      address
      postalCode
      city
      countryCode
      addressType
    }
    addresses {
      edges {
        node {
          primary
          id
          address
          postalCode
          city
          countryCode
          addressType
        }
      }
    }
    primaryEmail {
      id
      email
      primary
      emailType
    }
    emails {
      edges {
        node {
          primary
          id
          email
          emailType
        }
      }
    }
    primaryPhone {
      id
      phone
      primary
      phoneType
    }
    phones {
      edges {
        node {
          primary
          id
          phone
          phoneType
        }
      }
    }
  }

  mutation UpdateMyProfile($input: UpdateMyProfileMutationInput!) {
    updateMyProfile(input: $input) {
      profile {
        ...UpdateMyProfileMutation
      }
    }
  }
`;
