import { ProfileRoot, EmailNode } from '../../graphql/typings';

const getEmailsFromNode = (data?: ProfileRoot): EmailNode[] => {
  const edges = data?.myProfile?.emails?.edges || [];
  return edges
    .filter(edge => !edge?.node?.primary)
    .map(
      edge =>
        ({
          email: edge?.node?.email,
          id: edge?.node?.id,
          primary: edge?.node?.primary,
          emailType: edge?.node?.emailType,
          __typename: 'EmailNode',
        } as EmailNode)
    );
};

export default getEmailsFromNode;
