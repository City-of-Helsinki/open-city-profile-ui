/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ProfileInput } from "./../../../graphql/__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: CreateProfile
// ====================================================

export interface CreateProfile_updateProfile_profile {
  readonly __typename: "ProfileNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
}

export interface CreateProfile_updateProfile {
  readonly __typename: "UpdateProfile";
  readonly profile: CreateProfile_updateProfile_profile | null;
}

export interface CreateProfile {
  readonly updateProfile: CreateProfile_updateProfile | null;
}

export interface CreateProfileVariables {
  readonly profile: ProfileInput;
}
