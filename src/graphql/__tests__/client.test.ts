import { gql } from '@apollo/client';

import authService from '../../auth/authService';
import client from '../client';

describe('graphql client', () => {
  beforeEach(() => {
    global.fetch.resetMocks();
    jest.spyOn(authService, 'getToken').mockReturnValue('foo.bar.baz');
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

    const fetchOptions = global.fetch.mock.calls[0][1] as RequestInit;
    expect(fetchOptions.headers).toHaveProperty(
      'Authorization',
      'Bearer foo.bar.baz'
    );
  });
});
