import { ProfileRoot, PhoneNode } from '../../graphql/typings';

const getPhonesFromNode = (data?: ProfileRoot): PhoneNode[] => {
  const edges = data?.myProfile?.phones?.edges || [];
  return edges
    .filter(edge => !edge?.node?.primary)
    .map(
      edge =>
        ({
          primary: edge?.node?.primary,
          id: edge?.node?.id,
          phone: edge?.node?.phone,
          phoneType: edge?.node?.phoneType,
          __typename: 'PhoneNode',
        } as PhoneNode)
    );
};

export default getPhonesFromNode;
