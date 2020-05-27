import {
  QueryMySubscriptions_myProfile_subscriptions_edges as ProfileEdge,
  QuerySubscriptions_subscriptionTypeCategories_edges as SubscriptionEdge,
} from '../../graphql/generatedTypes';

const subscriptions: SubscriptionEdge[] = [
  {
    node: {
      id: '123',
      label: 'UpperLabel',
      code: 'UPPER_CODE',
      subscriptionTypes: {
        edges: [
          {
            node: {
              code: 'CODE_1',
              label: 'OptionLabel',
              id: '1234',
              __typename: 'SubscriptionTypeNode',
            },
            __typename: 'SubscriptionTypeNodeEdge',
          },
        ],
        __typename: 'SubscriptionTypeNodeConnection',
      },
      __typename: 'SubscriptionTypeCategoryNode',
    },
    __typename: 'SubscriptionTypeCategoryNodeEdge',
  },
];

const profile: ProfileEdge[] = [
  {
    node: {
      id: 'qwerty',
      enabled: true,
      subscriptionType: {
        code: 'CODE_1',
        __typename: 'SubscriptionTypeNode',
      },
      __typename: 'SubscriptionNode',
    },
    __typename: 'SubscriptionNodeEdge',
  },
];

export { subscriptions, profile };
