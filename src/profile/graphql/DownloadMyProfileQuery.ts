import gql from 'graphql-tag';
export const DOWNLOAD_MY_PROFILE = gql`
  query DownloadMyProfile(
    $authorizationCode: String!
    $authorizationCodeKeycloak: String
  ) {
    downloadMyProfile(
      authorizationCode: $authorizationCode
      authorizationCodeKeycloak: $authorizationCodeKeycloak
    )
  }
`;
