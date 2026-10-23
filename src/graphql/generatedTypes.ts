/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export enum AddressType {
  /** Home address */
  HOME = 'HOME',
  NONE = 'NONE',
  /** Other address */
  OTHER = 'OTHER',
  /** Work address */
  WORK = 'WORK'
}

/** An enumeration. */
export enum ContactMethod {
  EMAIL = 'EMAIL',
  SMS = 'SMS'
}

export interface CreateAddressInput {
  /** Street address. Maximum length is 128 characters. */
  readonly address: string;
  /** Address type. */
  readonly addressType: AddressType;
  /** City. Maximum length is 64 characters. */
  readonly city: string;
  /** An ISO 3166 alpha-2 country code. */
  readonly countryCode?: string | null | undefined;
  /** Postal code. Maximum length is 32 characters. */
  readonly postalCode: string;
  /** Is this primary address. */
  readonly primary?: boolean | null | undefined;
}

export interface CreateEmailInput {
  /** Email address. */
  readonly email: string;
  /** Email address type. */
  readonly emailType: EmailType;
  /** Is this primary mail address. */
  readonly primary?: boolean | null | undefined;
}

export interface CreatePhoneInput {
  /** Phone number. Must not be empty. */
  readonly phone: string;
  /** Phone number type. */
  readonly phoneType: PhoneType;
  /** Is this primary phone number. */
  readonly primary?: boolean | null | undefined;
}

export interface DeleteMyProfileMutationInput {
  /** OAuth/OIDC authorization code from Keycloak */
  readonly authorizationCode: string;
  readonly clientMutationId?: string | null | undefined;
  /** Can be used to see if the profile can be removed. Default is False. */
  readonly dryRun?: boolean | null | undefined;
}

export interface DeleteMyServiceDataMutationInput {
  /** OAuth/OIDC authorization code from Keycloak */
  readonly authorizationCode: string;
  /** Can be used to see if the date can be removed from the service. Default is False. */
  readonly dryRun?: boolean | null | undefined;
  /** The name of the service the data should be removed from */
  readonly serviceName: string;
}

export enum EmailType {
  NONE = 'NONE',
  /** Other email */
  OTHER = 'OTHER',
  /** Personal email */
  PERSONAL = 'PERSONAL',
  /** Work email */
  WORK = 'WORK'
}

/** An enumeration. */
export enum Language {
  ENGLISH = 'ENGLISH',
  FINNISH = 'FINNISH',
  SWEDISH = 'SWEDISH'
}

export enum LoginMethodType {
  /** One-time password */
  OTP = 'OTP',
  /** Salasana */
  PASSWORD = 'PASSWORD',
  /** Suomi.fi */
  SUOMI_FI = 'SUOMI_FI'
}

export enum PhoneType {
  /** Home phone */
  HOME = 'HOME',
  /** Mobile phone */
  MOBILE = 'MOBILE',
  NONE = 'NONE',
  /** Other phone */
  OTHER = 'OTHER',
  /** Work phone */
  WORK = 'WORK'
}

/**
 * The following fields are deprecated:
 *
 * * `image`
 *
 * There's no replacement for these.
 */
export interface ProfileInput {
  /** Add addresses to profile. */
  readonly addAddresses?: ReadonlyArray<CreateAddressInput | null | undefined> | null | undefined;
  /** Add emails to profile. */
  readonly addEmails?: ReadonlyArray<CreateEmailInput | null | undefined> | null | undefined;
  /** Add phone numbers to profile. */
  readonly addPhones?: ReadonlyArray<CreatePhoneInput | null | undefined> | null | undefined;
  /** Contact method. */
  readonly contactMethod?: ContactMethod | null | undefined;
  /** First name. Maximum length is 255 characters. */
  readonly firstName?: string | null | undefined;
  /** **DEPRECATED**. Any input is ignored. */
  readonly image?: string | null | undefined;
  /** Language. */
  readonly language?: Language | null | undefined;
  /** Last name. Maximum length is 255 characters. */
  readonly lastName?: string | null | undefined;
  /** Nickname. Maximum length is 32 characters. */
  readonly nickname?: string | null | undefined;
  /** Remove addresses from profile. */
  readonly removeAddresses?: ReadonlyArray<string | number | null | undefined> | null | undefined;
  /** Remove emails from profile. */
  readonly removeEmails?: ReadonlyArray<string | number | null | undefined> | null | undefined;
  /** Remove phone numbers from profile. */
  readonly removePhones?: ReadonlyArray<string | number | null | undefined> | null | undefined;
  readonly sensitivedata?: SensitiveDataFields | null | undefined;
  /** Update profile addresses. */
  readonly updateAddresses?: ReadonlyArray<UpdateAddressInput | null | undefined> | null | undefined;
  /** Update profile emails. */
  readonly updateEmails?: ReadonlyArray<UpdateEmailInput | null | undefined> | null | undefined;
  /** Update profile phone numbers. */
  readonly updatePhones?: ReadonlyArray<UpdatePhoneInput | null | undefined> | null | undefined;
}

export interface SensitiveDataFields {
  /** Finnish personal identity code. */
  readonly ssn?: string | null | undefined;
}

/** An enumeration. */
export enum TranslationLanguage {
  EN = 'EN',
  FI = 'FI',
  SV = 'SV'
}

export interface UpdateAddressInput {
  /** Street address. Maximum length is 128 characters. */
  readonly address?: string | null | undefined;
  /** Address type. */
  readonly addressType?: AddressType | null | undefined;
  /** City. Maximum length is 64 characters. */
  readonly city?: string | null | undefined;
  /** An ISO 3166 alpha-2 country code. */
  readonly countryCode?: string | null | undefined;
  readonly id: string | number;
  /** Postal code. Maximum length is 32 characters. */
  readonly postalCode?: string | null | undefined;
  /** Is this primary address. */
  readonly primary?: boolean | null | undefined;
}

export interface UpdateEmailInput {
  /** Email address. */
  readonly email?: string | null | undefined;
  /** Email address type. */
  readonly emailType?: EmailType | null | undefined;
  readonly id: string | number;
  /** Is this primary mail address. */
  readonly primary?: boolean | null | undefined;
}

export interface UpdateMyProfileMutationInput {
  readonly clientMutationId?: string | null | undefined;
  readonly profile: ProfileInput;
}

export interface UpdatePhoneInput {
  readonly id: string | number;
  /** Phone number. If provided, must not be empty. */
  readonly phone?: string | null | undefined;
  /** Phone number type. */
  readonly phoneType?: PhoneType | null | undefined;
  /** Is this primary phone number. */
  readonly primary?: boolean | null | undefined;
}

export type GdprDeleteMyProfileMutationDeleteMyProfileResultsErrorsFragment = { readonly __typename: 'ServiceConnectionDeletionError', readonly code: string };

export type GdprDeleteMyProfileMutationDeleteMyProfileResultsFragment = { readonly __typename: 'ServiceConnectionDeletionResult', readonly success: boolean, readonly errors: ReadonlyArray<{ readonly __typename: 'ServiceConnectionDeletionError', readonly code: string }>, readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly title: string | null } };

export type GdprDeleteMyProfileMutationDeleteMyProfileFragment = { readonly __typename: 'DeleteMyProfileMutationPayload', readonly results: ReadonlyArray<{ readonly __typename: 'ServiceConnectionDeletionResult', readonly success: boolean, readonly errors: ReadonlyArray<{ readonly __typename: 'ServiceConnectionDeletionError', readonly code: string }>, readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly title: string | null } }> };

export type GdprDeleteMyProfileMutationVariables = Exact<{
  input: DeleteMyProfileMutationInput;
  language: TranslationLanguage;
}>;


export type GdprDeleteMyProfileMutation = { readonly deleteMyProfile: { readonly __typename: 'DeleteMyProfileMutationPayload', readonly results: ReadonlyArray<{ readonly __typename: 'ServiceConnectionDeletionResult', readonly success: boolean, readonly errors: ReadonlyArray<{ readonly __typename: 'ServiceConnectionDeletionError', readonly code: string }>, readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly title: string | null } }> } | null };

export type GdprDeleteMyServiceDataMutationFragment = { readonly __typename: 'ServiceConnectionDeletionResult', readonly success: boolean, readonly errors: ReadonlyArray<{ readonly __typename: 'ServiceConnectionDeletionError', readonly code: string }> };

export type GdprDeleteMyServiceDataMutationVariables = Exact<{
  input: DeleteMyServiceDataMutationInput;
}>;


export type GdprDeleteMyServiceDataMutation = { readonly deleteMyServiceData: { readonly __typename: 'DeleteMyServiceDataMutationPayload', readonly result: { readonly __typename: 'ServiceConnectionDeletionResult', readonly success: boolean, readonly errors: ReadonlyArray<{ readonly __typename: 'ServiceConnectionDeletionError', readonly code: string }> } } | null };

export type GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeServiceFragment = { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string };

export type GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeFragment = { readonly __typename: 'ServiceConnectionType', readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string } };

export type GdprServiceConnectionsQueryMyProfileServiceConnectionsFragment = { readonly __typename: 'ServiceConnectionTypeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ServiceConnectionTypeEdge', readonly node: { readonly __typename: 'ServiceConnectionType', readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string } } | null } | null> };

export type GdprServiceConnectionsQueryMyProfileFragment = { readonly __typename: 'ProfileNode', readonly id: string, readonly serviceConnections: { readonly __typename: 'ServiceConnectionTypeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ServiceConnectionTypeEdge', readonly node: { readonly __typename: 'ServiceConnectionType', readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string } } | null } | null> } | null };

export type GdprServiceConnectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GdprServiceConnectionsQuery = { readonly myProfile: { readonly __typename: 'ProfileNode', readonly id: string, readonly serviceConnections: { readonly __typename: 'ServiceConnectionTypeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ServiceConnectionTypeEdge', readonly node: { readonly __typename: 'ServiceConnectionType', readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string } } | null } | null> } | null } | null };

export type DownloadMyProfileQueryVariables = Exact<{
  authorizationCode: string;
}>;


export type DownloadMyProfileQuery = { readonly downloadMyProfile: any };

export type MyProfileQueryVerifiedPersonalInformationPermanentForeignAddressFragment = { readonly __typename: 'VerifiedPersonalInformationForeignAddressNode', readonly streetAddress: string, readonly additionalAddress: string, readonly countryCode: string };

export type MyProfileQueryVerifiedPersonalInformationPermanentAddressFragment = { readonly __typename: 'VerifiedPersonalInformationAddressNode', readonly streetAddress: string, readonly postalCode: string, readonly postOffice: string };

export type MyProfileQueryVerifiedPersonalInformationFragment = { readonly __typename: 'VerifiedPersonalInformationNode', readonly firstName: string, readonly lastName: string, readonly givenName: string, readonly nationalIdentificationNumber: string, readonly municipalityOfResidence: string, readonly municipalityOfResidenceNumber: string, readonly permanentAddress: { readonly __typename: 'VerifiedPersonalInformationAddressNode', readonly streetAddress: string, readonly postalCode: string, readonly postOffice: string } | null, readonly permanentForeignAddress: { readonly __typename: 'VerifiedPersonalInformationForeignAddressNode', readonly streetAddress: string, readonly additionalAddress: string, readonly countryCode: string } | null };

export type MyProfileQueryPrimaryAddressFragment = { readonly __typename: 'AddressNode', readonly id: string, readonly primary: boolean, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null };

export type MyProfileQueryPrimaryEmailFragment = { readonly __typename: 'EmailNode', readonly id: string, readonly email: string, readonly primary: boolean, readonly emailType: EmailType | null };

export type MyProfileQueryPrimaryPhoneFragment = { readonly __typename: 'PhoneNode', readonly id: string, readonly phone: string, readonly primary: boolean, readonly phoneType: PhoneType | null };

export type MyProfileQueryAddressesEdgesNodeFragment = { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null };

export type MyProfileQueryEmailsEdgesNodeFragment = { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null };

export type MyProfileQueryPhonesEdgesNodeFragment = { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null };

export type MyLoginMethodNodeFragment = { readonly __typename: 'LoginMethodNode', readonly method: LoginMethodType, readonly createdAt: any, readonly credentialId: string | null, readonly userLabel: string | null };

export type MyProfileQueryAddressesEdgesFragment = { readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null };

export type MyProfileQueryEmailsEdgesFragment = { readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null };

export type MyProfileQueryPhonesEdgesFragment = { readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null };

export type MyProfileQueryAddressesFragment = { readonly __typename: 'AddressNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null } | null> };

export type MyProfileQueryEmailsFragment = { readonly __typename: 'EmailNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null } | null> };

export type MyProfileQueryPhonesFragment = { readonly __typename: 'PhoneNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null } | null> };

export type MyProfileQueryFragment = { readonly __typename: 'ProfileNode', readonly id: string, readonly firstName: string, readonly lastName: string, readonly nickname: string, readonly language: Language | null, readonly availableLoginMethods: ReadonlyArray<{ readonly __typename: 'LoginMethodNode', readonly method: LoginMethodType, readonly createdAt: any, readonly credentialId: string | null, readonly userLabel: string | null } | null> | null, readonly primaryAddress: { readonly __typename: 'AddressNode', readonly id: string, readonly primary: boolean, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null, readonly addresses: { readonly __typename: 'AddressNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null } | null> } | null, readonly primaryEmail: { readonly __typename: 'EmailNode', readonly id: string, readonly email: string, readonly primary: boolean, readonly emailType: EmailType | null } | null, readonly emails: { readonly __typename: 'EmailNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null } | null> } | null, readonly primaryPhone: { readonly __typename: 'PhoneNode', readonly id: string, readonly phone: string, readonly primary: boolean, readonly phoneType: PhoneType | null } | null, readonly phones: { readonly __typename: 'PhoneNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null } | null> } | null, readonly verifiedPersonalInformation: { readonly __typename: 'VerifiedPersonalInformationNode', readonly firstName: string, readonly lastName: string, readonly givenName: string, readonly nationalIdentificationNumber: string, readonly municipalityOfResidence: string, readonly municipalityOfResidenceNumber: string, readonly permanentAddress: { readonly __typename: 'VerifiedPersonalInformationAddressNode', readonly streetAddress: string, readonly postalCode: string, readonly postOffice: string } | null, readonly permanentForeignAddress: { readonly __typename: 'VerifiedPersonalInformationForeignAddressNode', readonly streetAddress: string, readonly additionalAddress: string, readonly countryCode: string } | null } | null };

export type MyProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type MyProfileQuery = { readonly myProfile: { readonly __typename: 'ProfileNode', readonly id: string, readonly firstName: string, readonly lastName: string, readonly nickname: string, readonly language: Language | null, readonly availableLoginMethods: ReadonlyArray<{ readonly __typename: 'LoginMethodNode', readonly method: LoginMethodType, readonly createdAt: any, readonly credentialId: string | null, readonly userLabel: string | null } | null> | null, readonly primaryAddress: { readonly __typename: 'AddressNode', readonly id: string, readonly primary: boolean, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null, readonly addresses: { readonly __typename: 'AddressNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null } | null> } | null, readonly primaryEmail: { readonly __typename: 'EmailNode', readonly id: string, readonly email: string, readonly primary: boolean, readonly emailType: EmailType | null } | null, readonly emails: { readonly __typename: 'EmailNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null } | null> } | null, readonly primaryPhone: { readonly __typename: 'PhoneNode', readonly id: string, readonly phone: string, readonly primary: boolean, readonly phoneType: PhoneType | null } | null, readonly phones: { readonly __typename: 'PhoneNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null } | null> } | null, readonly verifiedPersonalInformation: { readonly __typename: 'VerifiedPersonalInformationNode', readonly firstName: string, readonly lastName: string, readonly givenName: string, readonly nationalIdentificationNumber: string, readonly municipalityOfResidence: string, readonly municipalityOfResidenceNumber: string, readonly permanentAddress: { readonly __typename: 'VerifiedPersonalInformationAddressNode', readonly streetAddress: string, readonly postalCode: string, readonly postOffice: string } | null, readonly permanentForeignAddress: { readonly __typename: 'VerifiedPersonalInformationForeignAddressNode', readonly streetAddress: string, readonly additionalAddress: string, readonly countryCode: string } | null } | null } | null };

export type NameQueryVariables = Exact<{ [key: string]: never; }>;


export type NameQuery = { readonly myProfile: { readonly __typename: 'ProfileNode', readonly firstName: string, readonly lastName: string, readonly nickname: string } | null };

export type ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesNodeFragment = { readonly __typename: 'AllowedDataFieldNode', readonly fieldName: string, readonly label: string | null };

export type ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesFragment = { readonly __typename: 'AllowedDataFieldNodeEdge', readonly node: { readonly __typename: 'AllowedDataFieldNode', readonly fieldName: string, readonly label: string | null } | null };

export type ServiceConnectionsQueryEdgesNodeServiceFragment = { readonly __typename: 'ServiceNode', readonly name: string, readonly title: string | null, readonly description: string | null, readonly allowedDataFields: { readonly __typename: 'AllowedDataFieldNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AllowedDataFieldNodeEdge', readonly node: { readonly __typename: 'AllowedDataFieldNode', readonly fieldName: string, readonly label: string | null } | null } | null> } };

export type ServiceConnectionsQueryEdgesNodeFragment = { readonly __typename: 'ServiceConnectionType', readonly createdAt: any, readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly title: string | null, readonly description: string | null, readonly allowedDataFields: { readonly __typename: 'AllowedDataFieldNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AllowedDataFieldNodeEdge', readonly node: { readonly __typename: 'AllowedDataFieldNode', readonly fieldName: string, readonly label: string | null } | null } | null> } } };

export type ServiceConnectionsQueryVariables = Exact<{
  language: TranslationLanguage;
}>;


export type ServiceConnectionsQuery = { readonly myProfile: { readonly __typename: 'ProfileNode', readonly id: string, readonly serviceConnections: { readonly __typename: 'ServiceConnectionTypeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ServiceConnectionTypeEdge', readonly node: { readonly __typename: 'ServiceConnectionType', readonly createdAt: any, readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly title: string | null, readonly description: string | null, readonly allowedDataFields: { readonly __typename: 'AllowedDataFieldNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AllowedDataFieldNodeEdge', readonly node: { readonly __typename: 'AllowedDataFieldNode', readonly fieldName: string, readonly label: string | null } | null } | null> } } } | null } | null> } | null } | null };

export type UpdateMyProfileMutationFragment = { readonly __typename: 'ProfileNode', readonly id: string, readonly firstName: string, readonly lastName: string, readonly nickname: string, readonly language: Language | null, readonly primaryAddress: { readonly __typename: 'AddressNode', readonly id: string, readonly primary: boolean, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null, readonly addresses: { readonly __typename: 'AddressNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null } | null> } | null, readonly primaryEmail: { readonly __typename: 'EmailNode', readonly id: string, readonly email: string, readonly primary: boolean, readonly emailType: EmailType | null } | null, readonly emails: { readonly __typename: 'EmailNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null } | null> } | null, readonly primaryPhone: { readonly __typename: 'PhoneNode', readonly id: string, readonly phone: string, readonly primary: boolean, readonly phoneType: PhoneType | null } | null, readonly phones: { readonly __typename: 'PhoneNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null } | null> } | null };

export type UpdateMyProfileMutationVariables = Exact<{
  input: UpdateMyProfileMutationInput;
}>;


export type UpdateMyProfileMutation = { readonly updateMyProfile: { readonly __typename: 'UpdateMyProfileMutationPayload', readonly profile: { readonly __typename: 'ProfileNode', readonly id: string, readonly firstName: string, readonly lastName: string, readonly nickname: string, readonly language: Language | null, readonly primaryAddress: { readonly __typename: 'AddressNode', readonly id: string, readonly primary: boolean, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null, readonly addresses: { readonly __typename: 'AddressNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null } | null> } | null, readonly primaryEmail: { readonly __typename: 'EmailNode', readonly id: string, readonly email: string, readonly primary: boolean, readonly emailType: EmailType | null } | null, readonly emails: { readonly __typename: 'EmailNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null } | null> } | null, readonly primaryPhone: { readonly __typename: 'PhoneNode', readonly id: string, readonly phone: string, readonly primary: boolean, readonly phoneType: PhoneType | null } | null, readonly phones: { readonly __typename: 'PhoneNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null } | null> } | null } | null } | null };
