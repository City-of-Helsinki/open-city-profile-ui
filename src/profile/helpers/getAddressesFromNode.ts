import {
  MyProfileQuery,
  MyProfileQuery_myProfile_addresses_edges_node as Address,
} from '../../graphql/generatedTypes';

const getAddressesFromNode = (data?: MyProfileQuery): Address[] => {
  const edges = data?.myProfile?.addresses?.edges || [];
  return edges
    .filter(edge => !edge?.node?.primary)
    .map(
      edge =>
        ({
          primary: edge?.node?.primary,
          id: edge?.node?.id,
          address: edge?.node?.address,
          postalCode: edge?.node?.postalCode,
          city: edge?.node?.city,
          countryCode: edge?.node?.countryCode,
          addressType: edge?.node?.addressType,
          __typename: 'AddressNode',
        } as Address)
    );
};

export default getAddressesFromNode;
