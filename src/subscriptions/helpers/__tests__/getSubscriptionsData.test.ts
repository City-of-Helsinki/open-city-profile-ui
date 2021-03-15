import getSubscriptionsData from '../getSubscriptionsData';
import {
  MySubscriptionsRoot,
  MySubcriptionsEdge,
  SubcriptionsTypeCategoriesEdge,
  SubscriptionsRoot,
} from '../../../graphql/typings';
import {
  subscriptions,
  profile,
} from '../../../common/test/subscriptionTestData';

const getSubscriptions = (edges: SubcriptionsTypeCategoriesEdge[]) =>
  ({
    subscriptionTypeCategories: {
      edges: [...edges],
      __typename: 'SubscriptionTypeCategoryNodeConnection',
    },
  } as SubscriptionsRoot);

const getProfileData = (edges: MySubcriptionsEdge[]) =>
  ({
    myProfile: {
      id: '123',
      subscriptions: {
        edges: [...edges],
        __typename: 'SubscriptionNodeConnection',
      },
      __typename: 'ProfileWithVerifiedPersonalInformationNode',
    },
  } as MySubscriptionsRoot);

it('returns empty array', () => {
  const testData = getSubscriptionsData(
    getSubscriptions([]),
    getProfileData([])
  );
  expect(testData).toEqual([]);
});

describe('test option value', () => {
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
