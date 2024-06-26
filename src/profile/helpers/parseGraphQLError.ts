import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';

type ParsingResult = {
  isAllowedError: boolean;
  isInsufficientLoaError: boolean;
};

function getGraphQLErrors(error: ApolloError | Error): readonly GraphQLError[] {
  return (error as ApolloError).graphQLErrors || [];
}

function parseGraphQLError(error: ApolloError | Error): ParsingResult {
  const errorData = getGraphQLErrors(error)[0];
  if (
    errorData &&
    errorData.extensions?.code === 'PERMISSION_DENIED_ERROR' &&
    errorData.path?.join('.') === 'myProfile.verifiedPersonalInformation'
  ) {
    return { isAllowedError: true, isInsufficientLoaError: false };
  }

  if (errorData && errorData.extensions?.code === 'INSUFFICIENT_LOA_ERROR') {
    return { isAllowedError: false, isInsufficientLoaError: true };
  }

  return { isAllowedError: false, isInsufficientLoaError: false };
}

export default parseGraphQLError;
