import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { GraphQLError } from 'graphql';
import fetchMock from 'jest-fetch-mock';

import graphqlClient from '../../graphql/client';
import { ProfileData, UpdateProfileData } from '../../graphql/typings';
import { UpdateMyProfileVariables } from '../../graphql/generatedTypes';

export type MockedResponse = {
  profileData?: ProfileData;
  updatedProfileData?: UpdateProfileData;
  errorType?: 'networkError' | 'graphQLError';
};

export type ResponseProvider = (
  variables?: UpdateMyProfileVariables
) => MockedResponse;

export function MockApolloClientProvider({
  responseProvider,
  children,
}: {
  children: React.ReactElement | React.ReactNodeArray;
  responseProvider: ResponseProvider;
}): React.ReactElement {
  fetchMock.mockIf(/.*\/graphql\/.*$/, async (req: Request) => {
    const payload = await req.json();
    const response = createMockedProfileResponse(
      responseProvider(
        payload ? (payload.variables as UpdateMyProfileVariables) : undefined
      )
    );
    if (response.error) {
      return Promise.reject({
        body: JSON.stringify({ message: (response.error as Error).message }),
      });
    }
    return Promise.resolve({ body: JSON.stringify(response) });
  });
  return <ApolloProvider client={graphqlClient}>{children}</ApolloProvider>;
}

const getResponseData = (
  response: MockedResponse
): Record<string, unknown> | undefined => {
  const { errorType, profileData, updatedProfileData } = response;
  if (errorType) {
    return undefined;
  }
  return profileData
    ? { myProfile: profileData }
    : { updateMyProfile: { profile: updatedProfileData } };
};

const createResponse = (
  response: MockedResponse,
  data: unknown
): Record<string, unknown> => {
  const { errorType } = response;
  if (!errorType) {
    return { data };
  }
  return errorType === 'networkError'
    ? { error: new Error(`NetworkError at ${Date.now()}`) }
    : {
        errors: [new GraphQLError(`GraphQLError at ${Date.now()}`)],
      };
};

const createMockedProfileResponse = (
  response: MockedResponse
): Record<string, unknown> => {
  if (!response) {
    throw new Error('No response provided');
  }
  return createResponse(response, getResponseData(response));
};

export function resetApolloMocks(): void {
  fetchMock.resetMocks();
  graphqlClient.resetStore();
}
