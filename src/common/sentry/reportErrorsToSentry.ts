import { ApolloError } from '@apollo/client';
import { captureException } from '@sentry/react';

export default function reportErrorsToSentry(error: Error | ApolloError): void {
  const errorArray = (error as ApolloError).graphQLErrors;
  if (errorArray && errorArray.length) {
    errorArray.forEach((graphQlError) => {
      captureException(new Error(graphQlError.message));
    });
  } else {
    captureException(error);
  }
}
