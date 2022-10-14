import {
  GdprServiceConnectionsQuery_myProfile_serviceConnections,
  GdprServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service,
} from '../../graphql/generatedTypes';
import {
  Mutable,
  ServiceAllowedFieldsEdge,
  ServiceConnectionsRoot,
} from '../../graphql/typings';

export default function getMyProfileWithServiceConnections(
  addGdprQueryServiceData = false
): ServiceConnectionsRoot {
  const generateAllowedDataFieldEdge = (
    fieldName: string
  ): ServiceAllowedFieldsEdge => ({
    node: {
      fieldName,
      label: `${fieldName} Label`,
      __typename: 'AllowedDataFieldNode',
    },
    __typename: 'AllowedDataFieldNodeEdge',
  });

  const data = {
    myProfile: {
      id: 'asd',
      serviceConnections: {
        edges: [
          {
            node: {
              createdAt: '2021-03-10T11:34:14.719531+00:00',
              service: {
                name: 'Profile service name',
                title: 'Profiili käyttöliittymä',
                description:
                  'Henkilön omien profiilitietojen hallintakäyttöliittymä.',
                allowedDataFields: {
                  edges: [
                    generateAllowedDataFieldEdge('name'),
                    generateAllowedDataFieldEdge('email'),
                    generateAllowedDataFieldEdge('addresses'),
                    generateAllowedDataFieldEdge('phones'),
                    generateAllowedDataFieldEdge('Personal_identity_code'),
                    generateAllowedDataFieldEdge('Municipality_of_residence'),
                  ],
                  __typename: 'AllowedDataFieldNodeConnection',
                },
                __typename: 'ServiceNode',
              },
              __typename: 'ServiceConnectionType',
            },
            __typename: 'ServiceConnectionTypeEdge',
          },
          {
            node: {
              createdAt: '2020-03-10T11:34:14.719531+00:00',
              service: {
                name: 'Example UI service name',
                title: 'Example UI',
                description: 'Esimerkkiapplikaatio.',
                allowedDataFields: {
                  edges: [
                    generateAllowedDataFieldEdge('name'),
                    generateAllowedDataFieldEdge('email'),
                    generateAllowedDataFieldEdge('addresses'),
                    generateAllowedDataFieldEdge('phones'),
                    generateAllowedDataFieldEdge('Personal_identity_code'),
                    generateAllowedDataFieldEdge('Municipality_of_residence'),
                  ],
                  __typename: 'AllowedDataFieldNodeConnection',
                },
                __typename: 'ServiceNode',
              },
              __typename: 'ServiceConnectionType',
            },
            __typename: 'ServiceConnectionTypeEdge',
          },
        ],
        __typename: 'ServiceConnectionTypeConnection',
      },
      __typename: 'ProfileNode',
    },
  };
  if (addGdprQueryServiceData) {
    const connections = (data.myProfile
      .serviceConnections as unknown) as GdprServiceConnectionsQuery_myProfile_serviceConnections;
    connections.edges.forEach(edge => {
      const service = edge?.node?.service as Mutable<
        GdprServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service
      >;
      if (service) {
        service.gdprQueryScope = '';
        service.gdprDeleteScope = '';
      }
    });
  }

  return data as ServiceConnectionsRoot;
}
