import {
  ServiceAllowedFieldsEdge,
  ServiceConnectionsRoot,
} from '../../graphql/typings';

export default function getMyProfileWithServiceConnections(): ServiceConnectionsRoot {
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

  return {
    myProfile: {
      id: 'asd',
      serviceConnections: {
        edges: [
          {
            node: {
              createdAt: '2021-03-10T11:34:14.719531+00:00',
              service: {
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
        ],
        __typename: 'ServiceConnectionTypeConnection',
      },
      __typename: 'ProfileNode',
    },
  };
}
