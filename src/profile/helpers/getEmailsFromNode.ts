import {
  MyProfileQuery,
  MyProfileQuery_myProfile_emails_edges_node as Email,
} from '../../graphql/generatedTypes';

const getEmailsFromNode = (data?: MyProfileQuery) => {
  if (data?.myProfile?.emails?.edges) {
    return data.myProfile.emails.edges
      .map(edge => {
        if (edge?.node) {
          return {
            email: edge.node.email,
            id: edge.node.id,
            primary: edge.node.primary,
            emailType: edge.node.emailType,
          } as Email;
        }
        return false;
      })
      .filter((email): email is Email => Boolean(email))
      .filter((email: Email) => !email.primary);
  }
  return [];
};

export default getEmailsFromNode;
