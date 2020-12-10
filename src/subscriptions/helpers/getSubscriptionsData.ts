import {
  QueryMySubscriptions,
  QuerySubscriptions,
} from '../../graphql/generatedTypes';

type SubscriptionsData = {
  id: string | undefined;
  code: string | undefined;
  label: string | undefined | null;
  options: (Record<string, unknown> & { enabled: boolean })[] | undefined;
};
// options: (Record<string, unknown> & { enabled: boolean })[];
export default function getSubscriptionsData(
  data?: QuerySubscriptions,
  profileData?: QueryMySubscriptions
): SubscriptionsData[] {
  if (
    !data?.subscriptionTypeCategories ||
    !profileData?.myProfile?.subscriptions
  )
    return [];

  return data.subscriptionTypeCategories.edges.map(edge => {
    return {
      id: edge?.node?.id,
      code: edge?.node?.code,
      label: edge?.node?.label,
      options: edge?.node?.subscriptionTypes.edges.map(typeEdge => {
        const profileSubscription = profileData?.myProfile?.subscriptions?.edges.find(
          profileEdge =>
            profileEdge?.node?.subscriptionType?.code === typeEdge?.node?.code
        );
        return {
          ...typeEdge?.node,
          enabled: profileSubscription?.node?.enabled || false,
        };
      }),
    };
  });
}
