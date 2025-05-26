import { ProfileRoot, PhoneNode } from '../../graphql/typings';

const getPhonesFromNode = (data?: ProfileRoot, keepPrimary = false): PhoneNode[] => {
  const edges = data?.myProfile?.phones?.edges || [];
  return edges
    .filter((edge) => keepPrimary || !edge?.node?.primary)
    .map(
      (edge) =>
        ({
          primary: edge?.node?.primary,
          id: edge?.node?.id,
          phone: edge?.node?.phone,
          phoneType: edge?.node?.phoneType,
          __typename: 'PhoneNode',
        }) as PhoneNode,
    );
};

export default getPhonesFromNode;
