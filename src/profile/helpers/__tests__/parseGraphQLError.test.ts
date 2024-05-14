import { ApolloError } from '@apollo/client';

import parseGraphQLError from '../parseGraphQLError';

describe('parseGraphQLError', () => {
  it('should return isAllowedError true and isInsufficientLoaError false when error is permission denied', () => {
    const error: ApolloError = new ApolloError({
      graphQLErrors: [
        {
          extensions: {
            code: 'PERMISSION_DENIED_ERROR',
          },
          path: ['myProfile', 'verifiedPersonalInformation'],
          locations: undefined,
          nodes: undefined,
          source: undefined,
          positions: undefined,
          originalError: undefined,
          name: '',
          message: '',
        },
      ],
    });

    const result = parseGraphQLError(error);

    expect(result.isAllowedError).toBe(true);
    expect(result.isInsufficientLoaError).toBe(false);
  });

  it('should return isAllowedError false and isInsufficientLoaError true when error is insufficient loa', () => {
    const error: ApolloError = new ApolloError({
      graphQLErrors: [
        {
          extensions: {
            code: 'INSUFFICIENT_LOA_ERROR',
          },
          locations: undefined,
          path: undefined,
          nodes: undefined,
          source: undefined,
          positions: undefined,
          originalError: undefined,
          name: '',
          message: '',
        },
      ],
    });

    const result = parseGraphQLError(error);

    expect(result.isAllowedError).toBe(false);
    expect(result.isInsufficientLoaError).toBe(true);
  });

  it('should return isAllowedError false and isInsufficientLoaError false as a default', () => {
    const error: ApolloError = new ApolloError({
      graphQLErrors: [],
    });

    const result = parseGraphQLError(error);

    expect(result.isAllowedError).toBe(false);
    expect(result.isInsufficientLoaError).toBe(false);
  });
});
