import { gql } from '@apollo/client';

import client from '../client';

describe('graphql client', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  vi.mock('hds-react', async () => {
    // Get the original module to keep other functionalities intact
    const actualHdsReact = await vi.importActual('hds-react');
    return {
      ...actualHdsReact, // Spread the original implementation
      getApiTokensFromStorage: vi.fn(() => ({
        'https://api.hel.fi/auth/helsinkiprofile': 'foo.bar.baz',
      })), // Mock just this function
    };
  });

  it('sets authorization-header to requests', async () => {
    fetchMock.mockResponse(
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
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const fetchOptions = fetchMock.mock.calls[0][1] as RequestInit;
    expect(fetchOptions.headers).toHaveProperty(
      'authorization',
      'Bearer foo.bar.baz'
    );
  });
});
