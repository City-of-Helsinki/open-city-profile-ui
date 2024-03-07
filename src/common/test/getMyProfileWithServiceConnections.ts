import {
  GdprServiceConnectionsQueryMyProfileServiceConnectionsFragment,
  GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeServiceFragment,
} from '../../graphql/generatedTypes';
import {
  Mutable,
  Service,
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
                name: 'Profiili service name',
                title: 'Profiili käyttöliittymä',
                description:
                  'Henkilön omien profiilitietojen hallintakäyttöliittymä.',
                isPureKeycloak: true,
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
                name: 'Example service name',
                title: 'Example UI',
                description: 'Esimerkkiapplikaatio.',
                isPureKeycloak: false,
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
      .serviceConnections as unknown) as GdprServiceConnectionsQueryMyProfileServiceConnectionsFragment;
    connections.edges.forEach(edge => {
      const service = edge?.node?.service as Mutable<
        GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeServiceFragment
      >;
      if (service) {
        const serviceData = (service as unknown) as Service;
        service.gdprQueryScope = `${serviceData.name} gdprQueryScope`;
        service.gdprDeleteScope = `${serviceData.name} gdprDeleteScope`;
      }
    });
  }

  return data as ServiceConnectionsRoot;
}
