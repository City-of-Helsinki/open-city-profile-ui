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
  /**
   * Creates a new profile based on the given data. The new profile is linked to the currently authenticated user.
   * 
   * One or several of the following is possible to add:
   * 
   * * Email
   * * Address
   * * Phone
   * 
   * If youth data is given, a youth profile will also be created and linked to the profile.
   * 
   * Requires authentication.
   * 
   * Possible error codes:
   * 
   * * `TODO`
   */
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
  /**
   * Deletes the data of the profile which is linked to the currently authenticated user.
   * 
   * Requires authentication.
   * 
   * Possible error codes:
   * 
   * * `CANNOT_DELETE_PROFILE_WHILE_SERVICE_CONNECTED_ERROR`: Returned if the profile is connected to Berth service.
   * 
   * * `PROFILE_DOES_NOT_EXIST_ERROR`: Returned if there is no profile linked to the currently authenticated user.
   * 
   * * `TODO`
   */
  readonly deleteMyProfile: DeleteMyProfile_deleteMyProfile | null;
}

export interface DeleteMyProfileVariables {
  readonly input: DeleteMyProfileMutationInput;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DownloadMyProfile
// ====================================================

export interface DownloadMyProfile {
  /**
   * Get the user information stored in the profile as machine readable JSON.
   * 
   * Requires authentication.
   * 
   * Possible error codes:
   * 
   * * `TODO`
   */
  readonly downloadMyProfile: any | null;
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
  /**
   * Convenience field for the address which is marked as primary.
   */
  readonly primaryAddress: MyProfileQuery_myProfile_primaryAddress | null;
  /**
   * Convenience field for the email which is marked as primary.
   */
  readonly primaryEmail: MyProfileQuery_myProfile_primaryEmail | null;
  /**
   * Convenience field for the phone which is marked as primary.
   */
  readonly primaryPhone: MyProfileQuery_myProfile_primaryPhone | null;
}

export interface MyProfileQuery {
  /**
   * Get the profile belonging to the currently authenticated user.
   * 
   * Requires authentication.
   * 
   * Possible error codes:
   * 
   * * `TODO`
   */
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
  /**
   * Get the profile belonging to the currently authenticated user.
   * 
   * Requires authentication.
   * 
   * Possible error codes:
   * 
   * * `TODO`
   */
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
  /**
   * Get the profile belonging to the currently authenticated user.
   * 
   * Requires authentication.
   * 
   * Possible error codes:
   * 
   * * `TODO`
   */
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
  /**
   * List of the profile's connected services.
   */
  readonly serviceConnections: ServiceConnectionsQuery_myProfile_serviceConnections | null;
}

export interface ServiceConnectionsQuery {
  /**
   * Get the profile belonging to the currently authenticated user.
   * 
   * Requires authentication.
   * 
   * Possible error codes:
   * 
   * * `TODO`
   */
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
  /**
   * Convenience field for the address which is marked as primary.
   */
  readonly primaryAddress: UpdateMyProfile_updateMyProfile_profile_primaryAddress | null;
  /**
   * Convenience field for the email which is marked as primary.
   */
  readonly primaryEmail: UpdateMyProfile_updateMyProfile_profile_primaryEmail | null;
  /**
   * Convenience field for the phone which is marked as primary.
   */
  readonly primaryPhone: UpdateMyProfile_updateMyProfile_profile_primaryPhone | null;
}

export interface UpdateMyProfile_updateMyProfile {
  readonly __typename: "UpdateMyProfileMutationPayload";
  readonly profile: UpdateMyProfile_updateMyProfile_profile | null;
}

export interface UpdateMyProfile {
  /**
   * Updates the profile which is linked to the currently authenticated user based on the given data.
   * 
   * One or several of the following is possible to add, modify or remove:
   * 
   * * Email
   * * Address
   * * Phone
   * 
   * If youth data is given, a youth profile will also be created and linked to the
   * profile **or** the existing youth profile will be updated if the profile is
   * already linked to a youth profile.
   * 
   * Requires authentication.
   * 
   * Possible error codes:
   * 
   * * `TODO`
   */
  readonly updateMyProfile: UpdateMyProfile_updateMyProfile | null;
}

export interface UpdateMyProfileVariables {
  readonly input: UpdateMyProfileMutationInput;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: QueryMySubscriptions
// ====================================================

export interface QueryMySubscriptions_myProfile_subscriptions_edges_node_subscriptionType {
  readonly __typename: "SubscriptionTypeNode";
  readonly code: string;
}

export interface QueryMySubscriptions_myProfile_subscriptions_edges_node {
  readonly __typename: "SubscriptionNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly enabled: boolean;
  readonly subscriptionType: QueryMySubscriptions_myProfile_subscriptions_edges_node_subscriptionType;
}

export interface QueryMySubscriptions_myProfile_subscriptions_edges {
  readonly __typename: "SubscriptionNodeEdge";
  /**
   * The item at the end of the edge
   */
  readonly node: QueryMySubscriptions_myProfile_subscriptions_edges_node | null;
}

export interface QueryMySubscriptions_myProfile_subscriptions {
  readonly __typename: "SubscriptionNodeConnection";
  /**
   * Contains the nodes in this connection.
   */
  readonly edges: ReadonlyArray<(QueryMySubscriptions_myProfile_subscriptions_edges | null)>;
}

export interface QueryMySubscriptions_myProfile {
  readonly __typename: "ProfileNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly subscriptions: QueryMySubscriptions_myProfile_subscriptions | null;
}

export interface QueryMySubscriptions {
  /**
   * Get the profile belonging to the currently authenticated user.
   * 
   * Requires authentication.
   * 
   * Possible error codes:
   * 
   * * `TODO`
   */
  readonly myProfile: QueryMySubscriptions_myProfile | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: QuerySubscriptions
// ====================================================

export interface QuerySubscriptions_subscriptionTypeCategories_edges_node_subscriptionTypes_edges_node {
  readonly __typename: "SubscriptionTypeNode";
  readonly label: string | null;
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly code: string;
}

export interface QuerySubscriptions_subscriptionTypeCategories_edges_node_subscriptionTypes_edges {
  readonly __typename: "SubscriptionTypeNodeEdge";
  /**
   * The item at the end of the edge
   */
  readonly node: QuerySubscriptions_subscriptionTypeCategories_edges_node_subscriptionTypes_edges_node | null;
}

export interface QuerySubscriptions_subscriptionTypeCategories_edges_node_subscriptionTypes {
  readonly __typename: "SubscriptionTypeNodeConnection";
  /**
   * Contains the nodes in this connection.
   */
  readonly edges: ReadonlyArray<(QuerySubscriptions_subscriptionTypeCategories_edges_node_subscriptionTypes_edges | null)>;
}

export interface QuerySubscriptions_subscriptionTypeCategories_edges_node {
  readonly __typename: "SubscriptionTypeCategoryNode";
  /**
   * The ID of the object.
   */
  readonly id: string;
  readonly code: string;
  readonly label: string | null;
  readonly subscriptionTypes: QuerySubscriptions_subscriptionTypeCategories_edges_node_subscriptionTypes;
}

export interface QuerySubscriptions_subscriptionTypeCategories_edges {
  readonly __typename: "SubscriptionTypeCategoryNodeEdge";
  /**
   * The item at the end of the edge
   */
  readonly node: QuerySubscriptions_subscriptionTypeCategories_edges_node | null;
}

export interface QuerySubscriptions_subscriptionTypeCategories {
  readonly __typename: "SubscriptionTypeCategoryNodeConnection";
  /**
   * Contains the nodes in this connection.
   */
  readonly edges: ReadonlyArray<(QuerySubscriptions_subscriptionTypeCategories_edges | null)>;
}

export interface QuerySubscriptions {
  readonly subscriptionTypeCategories: QuerySubscriptions_subscriptionTypeCategories | null;
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
  readonly subscriptions?: ReadonlyArray<(SubscriptionInputType | null)> | null;
  readonly youthProfile?: YouthProfileFields | null;
  readonly sensitivedata?: SensitiveDataFields | null;
}

export interface SensitiveDataFields {
  readonly ssn?: string | null;
}

export interface SubscriptionInputType {
  readonly subscriptionTypeId?: string | null;
  readonly enabled?: boolean | null;
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
  readonly photoUsageApproved?: boolean | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
