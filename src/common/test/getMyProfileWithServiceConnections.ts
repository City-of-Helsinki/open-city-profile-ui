import {
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
                ...(addGdprQueryServiceData && {
                  gdprQueryScope: 'profileQueryScope',
                  gdprDeleteScope: 'profileDeleteScope',
                }),
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
                ...(addGdprQueryServiceData && {
                  gdprQueryScope: 'exampleQueryScope',
                  gdprDeleteScope: 'exampleDeleteScope',
                }),
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

  return data as ServiceConnectionsRoot;
}
