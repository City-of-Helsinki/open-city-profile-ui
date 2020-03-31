import getSubscriptionsData from '../getSubscriptionsData';
import {
  QueryMySubscriptions,
  QuerySubscriptions,
  QueryMySubscriptions_myProfile_subscriptions_edges as ProfileEdge,
  QuerySubscriptions_subscriptionTypeCategories_edges as SubscriptionEdge,
} from '../../../graphql/generatedTypes';

const getSubscriptions = (edges: SubscriptionEdge[]) => {
  return {
    subscriptionTypeCategories: {
      edges: [...edges],
      __typename: 'SubscriptionTypeCategoryNodeConnection',
    },
  } as QuerySubscriptions;
};

const getProfileData = (edges: ProfileEdge[]) => {
  return {
    myProfile: {
      id: '123',
      subscriptions: {
        edges: [...edges],
        __typename: 'SubscriptionNodeConnection',
      },
      __typename: 'ProfileNode',
    },
  } as QueryMySubscriptions;
};

it('returns empty array', () => {
  const testData = getSubscriptionsData(
    getSubscriptions([]),
    getProfileData([])
  );
  expect(testData).toEqual([]);
});

describe('test option value', () => {
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

  it('no profileData', () => {
    const testData = getSubscriptionsData(
      getSubscriptions(subscriptions),
      getProfileData([])
    );
    expect(testData[0]?.options?.length).toEqual(1);
    expect(testData[0]?.options && testData[0].options[0]?.enabled).toBeFalsy();
  });

  it('with profileData', () => {
    const testData = getSubscriptionsData(
      getSubscriptions(subscriptions),
      getProfileData(profile)
    );
    expect(
      testData[0]?.options && testData[0].options[0]?.enabled
    ).toBeTruthy();
  });
});
