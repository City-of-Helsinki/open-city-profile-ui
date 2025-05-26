import { ProfileRoot, AddressNode } from '../../graphql/typings';

const getAddressesFromNode = (data?: ProfileRoot, keepPrimary = false): AddressNode[] => {
  const edges = data?.myProfile?.addresses?.edges || [];
  return edges
    .filter((edge) => keepPrimary || !edge?.node?.primary)
    .map(
      (edge) =>
        ({
          primary: edge?.node?.primary,
          id: edge?.node?.id,
          address: edge?.node?.address,
          postalCode: edge?.node?.postalCode,
          city: edge?.node?.city,
          countryCode: edge?.node?.countryCode,
          addressType: edge?.node?.addressType,
          __typename: 'AddressNode',
        }) as AddressNode,
    );
};

export default getAddressesFromNode;
