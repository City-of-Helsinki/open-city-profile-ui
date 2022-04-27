import React from 'react';
import { ApolloError, ApolloProvider } from '@apollo/client';
import { ExecutionResult, GraphQLError } from 'graphql';
import fetchMock from 'jest-fetch-mock';

import graphqlClient from '../../graphql/client';
import {
  ProfileData,
  ServiceConnectionsQueryVariables,
  ServiceConnectionsRoot,
  UpdateProfileData,
} from '../../graphql/typings';
import {
  UpdateMyProfileVariables,
  ProfileInput,
} from '../../graphql/generatedTypes';

export type MockedResponse = {
  profileData?: ProfileData | null;
  createMyProfile?: ProfileInput;
  updatedProfileData?: UpdateProfileData;
  profileDataWithServiceConnections?: ServiceConnectionsRoot;
  errorType?: 'networkError' | 'graphQLError';
  withAllowedPermissionError?: boolean;
};

export type ResponseProvider = (
  variables?: UpdateMyProfileVariables | ServiceConnectionsQueryVariables
) => MockedResponse;

type ErrorReturnType = { error: Error };
type ResponseReturnType = ExecutionResult<ProfileData> | ErrorReturnType;

const getResponseData = (
  response: MockedResponse
): Record<string, unknown> | undefined => {
  const {
    errorType,
    profileData,
    updatedProfileData,
    createMyProfile,
    profileDataWithServiceConnections,
  } = response;
  if (errorType) {
    return undefined;
  }
  if (profileDataWithServiceConnections) {
    return (profileDataWithServiceConnections as unknown) as Record<
      string,
      unknown
    >;
  }
  if (createMyProfile) {
    return {
      createMyProfile: {
        profile: { id: 'only-id-required' },
      },
    };
  }
  return profileData !== undefined
    ? { myProfile: profileData }
    : { updateMyProfile: { profile: updatedProfileData } };
};

const createAllowedPermissionError = (): GraphQLError =>
  (({
    path: ['myProfile', 'verifiedPersonalInformation'],
    extensions: { code: 'PERMISSION_DENIED_ERROR' },
  } as unknown) as GraphQLError);

const addAllowedPermissionErrorToResponse = (
  data: ProfileData
): ExecutionResult<ProfileData> => ({
  data,
  errors: [createAllowedPermissionError()],
});

const createResponse = (
  response: MockedResponse,
  data: unknown
): ResponseReturnType => {
  const { errorType, withAllowedPermissionError } = response;
  if (!errorType) {
    return withAllowedPermissionError
      ? addAllowedPermissionErrorToResponse(data as ProfileData)
      : { data: data as ProfileData };
  }
  return errorType === 'networkError'
    ? { error: new Error(`NetworkError at ${Date.now()}`) }
    : {
        errors: [new GraphQLError(`GraphQLError at ${Date.now()}`)],
      };
};

const createMockedProfileResponse = (
  response: MockedResponse
): ResponseReturnType => {
  if (!response) {
    throw new Error('No response provided');
  }
  return createResponse(response, getResponseData(response));
};

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
    if ((response as ErrorReturnType).error) {
      return Promise.reject({
        body: JSON.stringify({
          message: (response as ErrorReturnType).error.message,
        }),
      });
    }
    return Promise.resolve({ body: JSON.stringify(response) });
  });
  return <ApolloProvider client={graphqlClient}>{children}</ApolloProvider>;
}

export const createApolloErrorWithAllowedPermissionError = (): ApolloError =>
  (({
    message: 'This is a fake ApolloError with allowed permission error',
    graphQLErrors: [createAllowedPermissionError()],
  } as unknown) as ApolloError);

export function resetApolloMocks(): void {
  fetchMock.resetMocks();
  graphqlClient.resetStore();
}
