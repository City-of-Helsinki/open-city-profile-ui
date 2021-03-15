import {
  MySubcriptionsEdge,
  SubcriptionsTypeCategoriesEdge,
} from '../../graphql/typings';

const subscriptions: SubcriptionsTypeCategoriesEdge[] = [
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

const profile: MySubcriptionsEdge[] = [
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
