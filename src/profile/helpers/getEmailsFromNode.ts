import {
  MyProfileQuery,
  MyProfileQuery_myProfile_emails_edges_node as Email,
} from '../../graphql/generatedTypes';

const getEmailsFromNode = (data?: MyProfileQuery) => {
  const edge = data?.myProfile?.emails?.edges || [];
  return edge
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
