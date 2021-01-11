import {
  MyProfileQuery,
  MyProfileQuery_myProfile_emails_edges_node as Email,
} from '../../graphql/generatedTypes';

const getEmailsFromNode = (data?: MyProfileQuery): Email[] => {
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
        } as Email)
    );
};

export default getEmailsFromNode;
