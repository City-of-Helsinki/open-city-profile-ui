import { gql } from 'apollo-boost';

import client from '../client';

jest.mock('../../auth/redux', () => {
  return {
    profileApiTokenSelector: () => 'foo.bar.baz',
  };
});

describe('graphql client', () => {
  beforeEach(() => {
    global.fetch.resetMocks();
  });

  it('sets Authorization-header to requests', async () => {
    global.fetch.mockResponse(
      JSON.stringify({
        data: {
          profile: null,
        },
      })
    );

    try {
      await client.query({
        query: gql`
          query FooQuery {
            profile
          }
        `,
      });
    } catch (e) {}

    const fetchOptions = global.fetch.mock.calls[0][1];
    expect(fetchOptions.headers).toHaveProperty(
      'Authorization',
      'Bearer foo.bar.baz'
    );
  });
});
