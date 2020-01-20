/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { DeleteMyProfileMutationInput } from "./../../../graphql/__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: DeleteMyProfile
// ====================================================

export interface DeleteMyProfile_deleteMyProfile {
  readonly __typename: "DeleteMyProfileMutationPayload";
  readonly clientMutationId: string | null;
}

export interface DeleteMyProfile {
  readonly deleteMyProfile: DeleteMyProfile_deleteMyProfile | null;
}

export interface DeleteMyProfileVariables {
  readonly input: DeleteMyProfileMutationInput;
}
