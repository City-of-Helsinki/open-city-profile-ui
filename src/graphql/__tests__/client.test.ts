import { gql } from '@apollo/client';
/*
import authService from '../../auth/authService';
import client from '../client';

describe('graphql client', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    vi.spyOn(authService, 'getToken').mockReturnValue('foo.bar.baz');
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

*/
