import gql from 'graphql-tag';

export const GDPR_SERVICE_CONNECTIONS = gql`
  fragment GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeService on ServiceNode {
    name
    gdprQueryScope
    gdprDeleteScope
    isPureKeycloak
  }

  fragment GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNode on ServiceConnectionType {
    service {
      ...GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeService
    }
  }

  fragment GdprServiceConnectionsQueryMyProfileServiceConnections on ServiceConnectionTypeConnection {
    edges {
      node {
        ...GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNode
      }
    }
  }

  fragment GdprServiceConnectionsQueryMyProfile on ProfileNode {
    id
    serviceConnections {
      ...GdprServiceConnectionsQueryMyProfileServiceConnections
    }
  }

  query GdprServiceConnections {
    myProfile {
      ...GdprServiceConnectionsQueryMyProfile
    }
  }
`;
