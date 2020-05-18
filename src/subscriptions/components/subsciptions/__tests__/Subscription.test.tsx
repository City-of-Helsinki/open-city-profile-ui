import React from 'react';
import { MockedProvider, MockedResponse } from '@apollo/react-testing';
import { mount } from 'enzyme';
import { loader } from 'graphql.macro';

import Subscriptions from '../Subscriptions';
import {
  QuerySubscriptions,
  QueryMySubscriptions,
  QueryMySubscriptions_myProfile_subscriptions_edges as ProfileEdges,
  QuerySubscriptions_subscriptionTypeCategories_edges as SubscriptionEdges,
} from '../../../../graphql/generatedTypes';
import {
  subscriptions,
  profile,
} from '../../../../common/test/subscriptionTestData';
import { updateWrapper } from '../../../../common/test/testUtils';

const QUERY_SUBSCRIPTIONS = loader(
  '../../../graphql/QuerySubscriptions.graphql'
);
const QUERY_MY_SUBSCRIPTIONS = loader(
  '../../../graphql/QueryMySubscriptions.graphql'
);

const getMocks = (
  subscriptionEdges: SubscriptionEdges[],
  profileEdges: ProfileEdges[]
) => {
  return [
    {
      request: {
        query: QUERY_SUBSCRIPTIONS,
        variables: {},
      },
      result: {
        data: {
          subscriptionTypeCategories: {
            edges: [...subscriptionEdges],
            __typename: 'SubscriptionTypeCategoryNodeConnection',
          },
        } as QuerySubscriptions,
      },
    },
    {
      request: {
        query: QUERY_MY_SUBSCRIPTIONS,
        variables: {},
      },
      result: {
        data: {
          myProfile: {
            subscriptions: {
              edges: [...profileEdges],
              __typename: 'SubscriptionNodeConnection',
            },
            id: '123',
            __typename: 'ProfileNode',
          },
        } as QueryMySubscriptions,
      },
    },
  ];
};

const getWrapper = (mocks: MockedResponse[]) => {
  return mount(
    <MockedProvider mocks={mocks}>
      <Subscriptions />
    </MockedProvider>
  );
};

it('data is empty', async () => {
  const mocks = getMocks([], []);
  const wrapper = getWrapper(mocks);

  await updateWrapper(wrapper);

  const explanation = wrapper.find('.empty').text();
  expect(explanation).toEqual('subscriptions.empty');
});

describe('test with data', () => {
  it('no profile data', async () => {
    const mocks = getMocks(subscriptions, []);
    const wrapper = getWrapper(mocks);

    await updateWrapper(wrapper);

    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(checkbox.props().checked).toBeFalsy();
  });

  it('with profile data', async () => {
    const mocks = getMocks(subscriptions, profile);
    const wrapper = getWrapper(mocks);

    await updateWrapper(wrapper);

    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(checkbox.props().checked).toBeTruthy();
  });
});
