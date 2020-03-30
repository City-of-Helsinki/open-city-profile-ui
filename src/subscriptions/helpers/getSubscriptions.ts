import { QueryMySubscriptions, QuerySubscriptions } from '../../graphql/generatedTypes';

export default function getSubscriptionsTypes(data?: QuerySubscriptions, profileData?: QueryMySubscriptions) {
  if (data?.subscriptionTypeCategories) {
    return data.subscriptionTypeCategories.edges.map(edge => {
      return {
        id: edge?.node?.id,
        code: edge?.node?.code,
        label: edge?.node?.label,
        options: edge?.node?.subscriptionTypes.edges.map(typeEdge => {
          return typeEdge?.node;
        }),
      };
    });
  }
}
