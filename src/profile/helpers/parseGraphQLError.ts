import { ApolloError } from 'apollo-boost';

type ParsingResult = { isAllowedError: boolean };

function parseGraphQLError(error: ApolloError): ParsingResult {
  const errorData = error.graphQLErrors[0];
  if (
    errorData &&
    errorData.extensions?.code === 'PERMISSION_DENIED_ERROR' &&
    errorData.path?.join('.') === 'myProfile.verifiedPersonalInformation'
  ) {
    return { isAllowedError: true };
  }
  return { isAllowedError: false };
}

export default parseGraphQLError;
