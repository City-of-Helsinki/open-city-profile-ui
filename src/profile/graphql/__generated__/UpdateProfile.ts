/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ProfileInput } from "./../../../graphql/__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateProfile
// ====================================================

export interface UpdateProfile_updateProfile_profile {
  readonly __typename: "ProfileNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
}

export interface UpdateProfile_updateProfile {
  readonly __typename: "UpdateProfile";
  readonly profile: UpdateProfile_updateProfile_profile | null;
}

export interface UpdateProfile {
  readonly updateProfile: UpdateProfile_updateProfile | null;
}

export interface UpdateProfileVariables {
  readonly profile: ProfileInput;
}
