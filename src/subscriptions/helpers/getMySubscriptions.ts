import { QueryMySubscriptions } from '../../graphql/generatedTypes';

export default function getMySubscriptionTypes(profileData?: QueryMySubscriptions) {
  if (!profileData?.myProfile?.subscriptions?.edges) return [];

  return profileData.myProfile.subscriptions?.edges.map(edge => {
    return {
      subscriptionTypeId: edge?.node?.id,
      enabled: edge?.node?.enabled,
      code: edge?.node?.subscriptionType?.code
    };
  });
} ;
