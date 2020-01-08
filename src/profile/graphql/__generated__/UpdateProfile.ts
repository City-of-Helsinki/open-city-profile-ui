/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ProfileInput } from "./../../../graphql/__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateProfile
// ====================================================

export interface UpdateProfile_updateProfile_profile_primaryAddress {
  readonly __typename: "AddressNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly address: string;
  readonly postalCode: string;
  readonly city: string;
}

export interface UpdateProfile_updateProfile_profile_primaryEmail {
  readonly __typename: "EmailNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly email: string;
}

export interface UpdateProfile_updateProfile_profile_primaryPhone {
  readonly __typename: "PhoneNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly phone: string | null;
}

export interface UpdateProfile_updateProfile_profile {
  readonly __typename: "ProfileNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly primaryAddress: UpdateProfile_updateProfile_profile_primaryAddress | null;
  readonly primaryEmail: UpdateProfile_updateProfile_profile_primaryEmail | null;
  readonly primaryPhone: UpdateProfile_updateProfile_profile_primaryPhone | null;
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
