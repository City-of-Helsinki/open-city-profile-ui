import gql from 'graphql-tag';
export const DOWNLOAD_MY_PROFILE = gql`
  query DownloadMyProfile($authorizationCode: String!) {
    downloadMyProfile(authorizationCode: $authorizationCode)
  }
`;
