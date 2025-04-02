import gql from 'graphql-tag';

export const SERVICE_CONNECTIONS = gql`
  fragment ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesNode on AllowedDataFieldNode {
    fieldName
    label(language: $language)
  }

  fragment ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdges on AllowedDataFieldNodeEdge {
    node {
      ...ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesNode
    }
  }

  fragment ServiceConnectionsQueryEdgesNodeService on ServiceNode {
    name
    title(language: $language)
    description(language: $language)
    allowedDataFields {
      edges {
        ...ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdges
      }
    }
  }

  fragment ServiceConnectionsQueryEdgesNode on ServiceConnectionType {
    service {
      ...ServiceConnectionsQueryEdgesNodeService
    }
    createdAt
  }

  query ServiceConnections($language: TranslationLanguage!) {
    myProfile {
      id
      serviceConnections {
        edges {
          node {
            ...ServiceConnectionsQueryEdgesNode
          }
        }
      }
    }
  }
`;
