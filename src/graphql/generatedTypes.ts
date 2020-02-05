/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateMyProfile
// ====================================================

export interface CreateMyProfile_createMyProfile_profile {
  readonly __typename: "ProfileNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
}

export interface CreateMyProfile_createMyProfile {
  readonly __typename: "CreateMyProfileMutationPayload";
  readonly profile: CreateMyProfile_createMyProfile_profile | null;
}

export interface CreateMyProfile {
  readonly createMyProfile: CreateMyProfile_createMyProfile | null;
}

export interface CreateMyProfileVariables {
  readonly input: CreateMyProfileMutationInput;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

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
  readonly nickname: string;
  readonly primaryAddress: MyProfileQuery_myProfile_primaryAddress | null;
  readonly primaryEmail: MyProfileQuery_myProfile_primaryEmail | null;
  readonly primaryPhone: MyProfileQuery_myProfile_primaryPhone | null;
}

export interface MyProfileQuery {
  readonly myProfile: MyProfileQuery_myProfile | null;
}

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

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ProfileExistsQuery
// ====================================================

export interface ProfileExistsQuery_myProfile {
  readonly __typename: "ProfileNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
}

export interface ProfileExistsQuery {
  readonly myProfile: ProfileExistsQuery_myProfile | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ServiceConnectionsQuery
// ====================================================

export interface ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service_allowedDataFields_edges_node {
  readonly __typename: "AllowedDataFieldNode";
  readonly fieldName: string;
  readonly label: string | null;
}

export interface ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service_allowedDataFields_edges {
  readonly __typename: "AllowedDataFieldNodeEdge";
  /**
   * The item at the end of the edge
   */
  readonly node: ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service_allowedDataFields_edges_node | null;
}

export interface ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service_allowedDataFields {
  readonly __typename: "AllowedDataFieldNodeConnection";
  /**
   * Contains the nodes in this connection.
   */
  readonly edges: ReadonlyArray<(ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service_allowedDataFields_edges | null)>;
}

export interface ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service {
  readonly __typename: "ServiceNode";
  readonly type: ServiceType | null;
  readonly title: string | null;
  readonly description: string | null;
  readonly createdAt: any;
  readonly allowedDataFields: ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service_allowedDataFields;
}

export interface ServiceConnectionsQuery_myProfile_serviceConnections_edges_node {
  readonly __typename: "ServiceConnectionType";
  readonly service: ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service;
}

export interface ServiceConnectionsQuery_myProfile_serviceConnections_edges {
  readonly __typename: "ServiceConnectionTypeEdge";
  /**
   * The item at the end of the edge
   */
  readonly node: ServiceConnectionsQuery_myProfile_serviceConnections_edges_node | null;
}

export interface ServiceConnectionsQuery_myProfile_serviceConnections {
  readonly __typename: "ServiceConnectionTypeConnection";
  /**
   * Contains the nodes in this connection.
   */
  readonly edges: ReadonlyArray<(ServiceConnectionsQuery_myProfile_serviceConnections_edges | null)>;
}

export interface ServiceConnectionsQuery_myProfile {
  readonly __typename: "ProfileNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly serviceConnections: ServiceConnectionsQuery_myProfile_serviceConnections | null;
}

export interface ServiceConnectionsQuery {
  readonly myProfile: ServiceConnectionsQuery_myProfile | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

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

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum AddressType {
  HOME = "HOME",
  NONE = "NONE",
  OTHER = "OTHER",
  WORK = "WORK",
}

/**
 * An enumeration.
 */
export enum ContactMethod {
  EMAIL = "EMAIL",
  SMS = "SMS",
}

export enum EmailType {
  NONE = "NONE",
  OTHER = "OTHER",
  PERSONAL = "PERSONAL",
  WORK = "WORK",
}

/**
 * An enumeration.
 */
export enum Language {
  ENGLISH = "ENGLISH",
  FINNISH = "FINNISH",
  SWEDISH = "SWEDISH",
}

export enum PhoneType {
  HOME = "HOME",
  MOBILE = "MOBILE",
  NONE = "NONE",
  OTHER = "OTHER",
  WORK = "WORK",
}

export enum ServiceType {
  BERTH = "BERTH",
  GODCHILDREN_OF_CULTURE = "GODCHILDREN_OF_CULTURE",
  HKI_MY_DATA = "HKI_MY_DATA",
  YOUTH_MEMBERSHIP = "YOUTH_MEMBERSHIP",
}

export enum YouthLanguage {
  ARABIC = "ARABIC",
  ENGLISH = "ENGLISH",
  ESTONIAN = "ESTONIAN",
  FINNISH = "FINNISH",
  RUSSIAN = "RUSSIAN",
  SOMALI = "SOMALI",
  SWEDISH = "SWEDISH",
}

export interface AddressInput {
  readonly id?: string | null;
  readonly address: string;
  readonly postalCode: string;
  readonly city: string;
  readonly countryCode?: string | null;
  readonly addressType: AddressType;
  readonly primary?: boolean | null;
}

export interface CreateMyProfileMutationInput {
  readonly profile: ProfileInput;
  readonly clientMutationId?: string | null;
}

export interface DeleteMyProfileMutationInput {
  readonly clientMutationId?: string | null;
}

export interface EmailInput {
  readonly id?: string | null;
  readonly email?: string | null;
  readonly emailType: EmailType;
  readonly primary?: boolean | null;
}

export interface PhoneInput {
  readonly id?: string | null;
  readonly phone: string;
  readonly phoneType: PhoneType;
  readonly primary?: boolean | null;
}

export interface ProfileInput {
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly nickname?: string | null;
  readonly image?: string | null;
  readonly language?: Language | null;
  readonly contactMethod?: ContactMethod | null;
  readonly addEmails?: ReadonlyArray<(EmailInput | null)> | null;
  readonly updateEmails?: ReadonlyArray<(EmailInput | null)> | null;
  readonly removeEmails?: ReadonlyArray<(string | null)> | null;
  readonly addPhones?: ReadonlyArray<(PhoneInput | null)> | null;
  readonly updatePhones?: ReadonlyArray<(PhoneInput | null)> | null;
  readonly removePhones?: ReadonlyArray<(string | null)> | null;
  readonly addAddresses?: ReadonlyArray<(AddressInput | null)> | null;
  readonly updateAddresses?: ReadonlyArray<(AddressInput | null)> | null;
  readonly removeAddresses?: ReadonlyArray<(string | null)> | null;
  readonly youthProfile?: YouthProfileFields | null;
}

export interface UpdateMyProfileMutationInput {
  readonly profile: ProfileInput;
  readonly clientMutationId?: string | null;
}

export interface YouthProfileFields {
  readonly schoolName?: string | null;
  readonly schoolClass?: string | null;
  readonly languageAtHome?: YouthLanguage | null;
  readonly approverFirstName?: string | null;
  readonly approverLastName?: string | null;
  readonly approverPhone?: string | null;
  readonly approverEmail?: string | null;
  readonly birthDate?: any | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
