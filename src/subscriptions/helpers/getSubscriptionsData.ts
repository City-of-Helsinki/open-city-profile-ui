import { MySubscriptionsRoot, SubscriptionsRoot } from '../../graphql/typings';

type SubscriptionsData = {
  id: string | undefined;
  code: string | undefined;
  label: string | undefined | null;
  options: (Record<string, unknown> & { enabled: boolean })[] | undefined;
};
export default function getSubscriptionsData(
  data?: SubscriptionsRoot,
  profileData?: MySubscriptionsRoot
): SubscriptionsData[] {
  if (
    !data?.subscriptionTypeCategories ||
    !profileData?.myProfile?.subscriptions
  ) {
    return [];
  }

  return data.subscriptionTypeCategories.edges.map(edge => ({
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
  }));
}
