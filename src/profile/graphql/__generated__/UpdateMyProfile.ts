/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { UpdateMyProfileMutationInput } from "./../../../graphql/__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateMyProfile
// ====================================================

export interface UpdateMyProfile_updateMyProfile_profile_primaryAddress {
  readonly __typename: "AddressNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly address: string;
  readonly postalCode: string;
  readonly city: string;
}

export interface UpdateMyProfile_updateMyProfile_profile_primaryEmail {
  readonly __typename: "EmailNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly email: string;
}

export interface UpdateMyProfile_updateMyProfile_profile_primaryPhone {
  readonly __typename: "PhoneNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly phone: string | null;
}

export interface UpdateMyProfile_updateMyProfile_profile {
  readonly __typename: "ProfileNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly primaryAddress: UpdateMyProfile_updateMyProfile_profile_primaryAddress | null;
  readonly primaryEmail: UpdateMyProfile_updateMyProfile_profile_primaryEmail | null;
  readonly primaryPhone: UpdateMyProfile_updateMyProfile_profile_primaryPhone | null;
}

export interface UpdateMyProfile_updateMyProfile {
  readonly __typename: "UpdateMyProfileMutationPayload";
  readonly profile: UpdateMyProfile_updateMyProfile_profile | null;
}

export interface UpdateMyProfile {
  readonly updateMyProfile: UpdateMyProfile_updateMyProfile | null;
}

export interface UpdateMyProfileVariables {
  readonly input: UpdateMyProfileMutationInput;
}
