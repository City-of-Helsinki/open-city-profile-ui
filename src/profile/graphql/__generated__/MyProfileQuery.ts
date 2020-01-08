/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MyProfileQuery
// ====================================================

export interface MyProfileQuery_myProfile_primaryAddress {
  readonly __typename: "AddressNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly address: string;
  readonly postalCode: string;
  readonly city: string;
}

export interface MyProfileQuery_myProfile_primaryEmail {
  readonly __typename: "EmailNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly email: string;
}

export interface MyProfileQuery_myProfile_primaryPhone {
  readonly __typename: "PhoneNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly phone: string | null;
}

export interface MyProfileQuery_myProfile {
  readonly __typename: "ProfileNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly nickname: string | null;
  readonly primaryAddress: MyProfileQuery_myProfile_primaryAddress | null;
  readonly primaryEmail: MyProfileQuery_myProfile_primaryEmail | null;
  readonly primaryPhone: MyProfileQuery_myProfile_primaryPhone | null;
}

export interface MyProfileQuery {
  readonly myProfile: MyProfileQuery_myProfile | null;
}
