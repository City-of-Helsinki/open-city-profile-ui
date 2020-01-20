/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NameQuery
// ====================================================

export interface NameQuery_myProfile {
  readonly __typename: "ProfileNode";
  readonly firstName: string;
  readonly lastName: string;
  readonly nickname: string;
}

export interface NameQuery {
  readonly myProfile: NameQuery_myProfile | null;
}
