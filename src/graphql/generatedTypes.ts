/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSONString: { input: any; output: any; }
  UUID: { input: any; output: any; }
  _Any: { input: any; output: any; }
}

export interface AddServiceConnectionMutationInput {
  readonly clientMutationId?: InputMaybe<Scalars['String']['input']>;
  readonly serviceConnection: ServiceConnectionInput;
}

export enum AddressType {
  /** Home address */
  HOME = 'HOME',
  NONE = 'NONE',
  /** Other address */
  OTHER = 'OTHER',
  /** Work address */
  WORK = 'WORK'
}

export interface ClaimProfileMutationInput {
  readonly clientMutationId?: InputMaybe<Scalars['String']['input']>;
  readonly profile?: InputMaybe<ProfileInput>;
  readonly token: Scalars['UUID']['input'];
}

/** An enumeration. */
export enum ContactMethod {
  EMAIL = 'EMAIL',
  SMS = 'SMS'
}

export interface CreateAddressInput {
  /** Street address. Maximum length is 128 characters. */
  readonly address: Scalars['String']['input'];
  /** Address type. */
  readonly addressType: AddressType;
  /** City. Maximum length is 64 characters. */
  readonly city: Scalars['String']['input'];
  /** An ISO 3166 alpha-2 country code. */
  readonly countryCode?: InputMaybe<Scalars['String']['input']>;
  /** Postal code. Maximum length is 32 characters. */
  readonly postalCode: Scalars['String']['input'];
  /** Is this primary address. */
  readonly primary?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface CreateEmailInput {
  /** Email address. */
  readonly email: Scalars['String']['input'];
  /** Email address type. */
  readonly emailType: EmailType;
  /** Is this primary mail address. */
  readonly primary?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface CreateMyProfileMutationInput {
  readonly clientMutationId?: InputMaybe<Scalars['String']['input']>;
  readonly profile: ProfileInput;
}

export interface CreateMyProfileTemporaryReadAccessTokenMutationInput {
  readonly clientMutationId?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateOrUpdateProfileWithVerifiedPersonalInformationMutationInput {
  readonly profile: ProfileWithVerifiedPersonalInformationInput;
  /** Connect the profile to the service identified by this client id. */
  readonly serviceClientId?: InputMaybe<Scalars['String']['input']>;
  /** The **user id** of the user the Profile is or will be associated with. */
  readonly userId: Scalars['UUID']['input'];
}

export interface CreateOrUpdateUserProfileMutationInput {
  readonly profile: ProfileWithVerifiedPersonalInformationInput;
  /** Connect the profile to the service identified by this client id. */
  readonly serviceClientId?: InputMaybe<Scalars['String']['input']>;
  /** The **user id** of the user the Profile is or will be associated with. */
  readonly userId: Scalars['UUID']['input'];
}

export interface CreatePhoneInput {
  /** Phone number. Must not be empty. */
  readonly phone: Scalars['String']['input'];
  /** Phone number type. */
  readonly phoneType: PhoneType;
  /** Is this primary phone number. */
  readonly primary?: InputMaybe<Scalars['Boolean']['input']>;
}

/**
 * The following fields are deprecated:
 *
 * * `image`
 * * `update_emails`
 * * `remove_emails`
 * * `update_phones`
 * * `remove_phones`
 * * `update_addresses`
 * * `remove_addresses`
 *
 * There's no replacement for these.
 */
export interface CreateProfileInput {
  /** Add addresses to profile. */
  readonly addAddresses?: InputMaybe<ReadonlyArray<InputMaybe<CreateAddressInput>>>;
  /** Add emails to profile. */
  readonly addEmails?: InputMaybe<ReadonlyArray<InputMaybe<CreateEmailInput>>>;
  /** Add phone numbers to profile. */
  readonly addPhones?: InputMaybe<ReadonlyArray<InputMaybe<CreatePhoneInput>>>;
  /** Contact method. */
  readonly contactMethod?: InputMaybe<ContactMethod>;
  /** First name. Maximum length is 255 characters. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** **DEPRECATED**. Any input is ignored. */
  readonly image?: InputMaybe<Scalars['String']['input']>;
  /** Language. */
  readonly language?: InputMaybe<Language>;
  /** Last name. Maximum length is 255 characters. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** Nickname. Maximum length is 32 characters. */
  readonly nickname?: InputMaybe<Scalars['String']['input']>;
  /** **DEPRECATED**. Any input is ignored. */
  readonly removeAddresses?: InputMaybe<ReadonlyArray<InputMaybe<Scalars['ID']['input']>>>;
  /** **DEPRECATED**. Any input is ignored. */
  readonly removeEmails?: InputMaybe<ReadonlyArray<InputMaybe<Scalars['ID']['input']>>>;
  /** **DEPRECATED**. Any input is ignored. */
  readonly removePhones?: InputMaybe<ReadonlyArray<InputMaybe<Scalars['ID']['input']>>>;
  readonly sensitivedata?: InputMaybe<SensitiveDataFields>;
  /** **DEPRECATED**. Any input is ignored. */
  readonly updateAddresses?: InputMaybe<ReadonlyArray<InputMaybe<UpdateAddressInput>>>;
  /** **DEPRECATED**. Any input is ignored. */
  readonly updateEmails?: InputMaybe<ReadonlyArray<InputMaybe<UpdateEmailInput>>>;
  /** **DEPRECATED**. Any input is ignored. */
  readonly updatePhones?: InputMaybe<ReadonlyArray<InputMaybe<UpdatePhoneInput>>>;
}

export interface CreateProfileMutationInput {
  readonly clientMutationId?: InputMaybe<Scalars['String']['input']>;
  readonly profile: CreateProfileInput;
  /** **OBSOLETE**: doesn't do anything. Requester's service is determined by authentication. */
  readonly serviceType?: InputMaybe<ServiceType>;
}

export interface DeleteMyProfileMutationInput {
  /** OAuth/OIDC authorization code from Tunnistamo. When obtaining the code, it is required to use service and operation specific GDPR API scopes. */
  readonly authorizationCode: Scalars['String']['input'];
  /** OAuth/OIDC authorization code from Keycloak */
  readonly authorizationCodeKeycloak?: InputMaybe<Scalars['String']['input']>;
  readonly clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** Can be used to see if the profile can be removed. Default is False. */
  readonly dryRun?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface DeleteMyServiceDataMutationInput {
  /** OAuth/OIDC authorization code from Tunnistamo. When obtaining the code, it is required to use service and operation specific GDPR API scopes. */
  readonly authorizationCode: Scalars['String']['input'];
  /** OAuth/OIDC authorization code from Keycloak */
  readonly authorizationCodeKeycloak?: InputMaybe<Scalars['String']['input']>;
  /** Can be used to see if the date can be removed from the service. Default is False. */
  readonly dryRun?: InputMaybe<Scalars['Boolean']['input']>;
  /** The name of the service the data should be removed from */
  readonly serviceName: Scalars['String']['input'];
}

export interface EmailInput {
  /** The email address. */
  readonly email: Scalars['String']['input'];
  /** Sets whether the primary email address has been verified. If not given, defaults to False. */
  readonly verified?: InputMaybe<Scalars['Boolean']['input']>;
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
  readonly addAddresses?: InputMaybe<ReadonlyArray<InputMaybe<CreateAddressInput>>>;
  /** Add emails to profile. */
  readonly addEmails?: InputMaybe<ReadonlyArray<InputMaybe<CreateEmailInput>>>;
  /** Add phone numbers to profile. */
  readonly addPhones?: InputMaybe<ReadonlyArray<InputMaybe<CreatePhoneInput>>>;
  /** Contact method. */
  readonly contactMethod?: InputMaybe<ContactMethod>;
  /** First name. Maximum length is 255 characters. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** **DEPRECATED**. Any input is ignored. */
  readonly image?: InputMaybe<Scalars['String']['input']>;
  /** Language. */
  readonly language?: InputMaybe<Language>;
  /** Last name. Maximum length is 255 characters. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** Nickname. Maximum length is 32 characters. */
  readonly nickname?: InputMaybe<Scalars['String']['input']>;
  /** Remove addresses from profile. */
  readonly removeAddresses?: InputMaybe<ReadonlyArray<InputMaybe<Scalars['ID']['input']>>>;
  /** Remove emails from profile. */
  readonly removeEmails?: InputMaybe<ReadonlyArray<InputMaybe<Scalars['ID']['input']>>>;
  /** Remove phone numbers from profile. */
  readonly removePhones?: InputMaybe<ReadonlyArray<InputMaybe<Scalars['ID']['input']>>>;
  readonly sensitivedata?: InputMaybe<SensitiveDataFields>;
  /** Update profile addresses. */
  readonly updateAddresses?: InputMaybe<ReadonlyArray<InputMaybe<UpdateAddressInput>>>;
  /** Update profile emails. */
  readonly updateEmails?: InputMaybe<ReadonlyArray<InputMaybe<UpdateEmailInput>>>;
  /** Update profile phone numbers. */
  readonly updatePhones?: InputMaybe<ReadonlyArray<InputMaybe<UpdatePhoneInput>>>;
}

export interface ProfileWithVerifiedPersonalInformationInput {
  /** First name. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** Last name. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** Sets the profile's primary email address. */
  readonly primaryEmail?: InputMaybe<EmailInput>;
  readonly verifiedPersonalInformation?: InputMaybe<VerifiedPersonalInformationInput>;
}

export interface SensitiveDataFields {
  /** Finnish personal identity code. */
  readonly ssn?: InputMaybe<Scalars['String']['input']>;
}

export interface ServiceConnectionInput {
  readonly enabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** **OBSOLETE**: doesn't do anything. Requester's service is determined by authentication. */
  readonly service?: InputMaybe<ServiceInput>;
}

export interface ServiceInput {
  readonly type?: InputMaybe<ServiceType>;
}

export enum ServiceType {
  /**
   * Berth
   * @deprecated The whole ServiceType enum is deprecated and shouldn't be used anymore. There are different replacements in various places, depending on how this type was used.
   */
  BERTH = 'BERTH',
  /**
   * Godchildren of Culture
   * @deprecated The whole ServiceType enum is deprecated and shouldn't be used anymore. There are different replacements in various places, depending on how this type was used.
   */
  GODCHILDREN_OF_CULTURE = 'GODCHILDREN_OF_CULTURE',
  /**
   * Helsinki My Data
   * @deprecated The whole ServiceType enum is deprecated and shouldn't be used anymore. There are different replacements in various places, depending on how this type was used.
   */
  HKI_MY_DATA = 'HKI_MY_DATA',
  /**
   * Youth Membership
   * @deprecated The whole ServiceType enum is deprecated and shouldn't be used anymore. There are different replacements in various places, depending on how this type was used.
   */
  YOUTH_MEMBERSHIP = 'YOUTH_MEMBERSHIP'
}

/** An enumeration. */
export enum TranslationLanguage {
  EN = 'EN',
  FI = 'FI',
  SV = 'SV'
}

export interface UpdateAddressInput {
  /** Street address. Maximum length is 128 characters. */
  readonly address?: InputMaybe<Scalars['String']['input']>;
  /** Address type. */
  readonly addressType?: InputMaybe<AddressType>;
  /** City. Maximum length is 64 characters. */
  readonly city?: InputMaybe<Scalars['String']['input']>;
  /** An ISO 3166 alpha-2 country code. */
  readonly countryCode?: InputMaybe<Scalars['String']['input']>;
  readonly id: Scalars['ID']['input'];
  /** Postal code. Maximum length is 32 characters. */
  readonly postalCode?: InputMaybe<Scalars['String']['input']>;
  /** Is this primary address. */
  readonly primary?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface UpdateEmailInput {
  /** Email address. */
  readonly email?: InputMaybe<Scalars['String']['input']>;
  /** Email address type. */
  readonly emailType?: InputMaybe<EmailType>;
  readonly id: Scalars['ID']['input'];
  /** Is this primary mail address. */
  readonly primary?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface UpdateMyProfileMutationInput {
  readonly clientMutationId?: InputMaybe<Scalars['String']['input']>;
  readonly profile: ProfileInput;
}

export interface UpdatePhoneInput {
  readonly id: Scalars['ID']['input'];
  /** Phone number. If provided, must not be empty. */
  readonly phone?: InputMaybe<Scalars['String']['input']>;
  /** Phone number type. */
  readonly phoneType?: InputMaybe<PhoneType>;
  /** Is this primary phone number. */
  readonly primary?: InputMaybe<Scalars['Boolean']['input']>;
}

/**
 * The following fields are deprecated:
 *
 * * `image`
 *
 * There's no replacement for these.
 */
export interface UpdateProfileInput {
  /** Add addresses to profile. */
  readonly addAddresses?: InputMaybe<ReadonlyArray<InputMaybe<CreateAddressInput>>>;
  /** Add emails to profile. */
  readonly addEmails?: InputMaybe<ReadonlyArray<InputMaybe<CreateEmailInput>>>;
  /** Add phone numbers to profile. */
  readonly addPhones?: InputMaybe<ReadonlyArray<InputMaybe<CreatePhoneInput>>>;
  /** Contact method. */
  readonly contactMethod?: InputMaybe<ContactMethod>;
  /** First name. Maximum length is 255 characters. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  readonly id: Scalars['ID']['input'];
  /** **DEPRECATED**. Any input is ignored. */
  readonly image?: InputMaybe<Scalars['String']['input']>;
  /** Language. */
  readonly language?: InputMaybe<Language>;
  /** Last name. Maximum length is 255 characters. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** Nickname. Maximum length is 32 characters. */
  readonly nickname?: InputMaybe<Scalars['String']['input']>;
  /** Remove addresses from profile. */
  readonly removeAddresses?: InputMaybe<ReadonlyArray<InputMaybe<Scalars['ID']['input']>>>;
  /** Remove emails from profile. */
  readonly removeEmails?: InputMaybe<ReadonlyArray<InputMaybe<Scalars['ID']['input']>>>;
  /** Remove phone numbers from profile. */
  readonly removePhones?: InputMaybe<ReadonlyArray<InputMaybe<Scalars['ID']['input']>>>;
  readonly sensitivedata?: InputMaybe<SensitiveDataFields>;
  /** Update profile addresses. */
  readonly updateAddresses?: InputMaybe<ReadonlyArray<InputMaybe<UpdateAddressInput>>>;
  /** Update profile emails. */
  readonly updateEmails?: InputMaybe<ReadonlyArray<InputMaybe<UpdateEmailInput>>>;
  /** Update profile phone numbers. */
  readonly updatePhones?: InputMaybe<ReadonlyArray<InputMaybe<UpdatePhoneInput>>>;
}

export interface UpdateProfileMutationInput {
  readonly clientMutationId?: InputMaybe<Scalars['String']['input']>;
  readonly profile: UpdateProfileInput;
  /** **OBSOLETE**: doesn't do anything. Requester's service is determined by authentication. */
  readonly serviceType?: InputMaybe<ServiceType>;
}

export interface VerifiedPersonalInformationAddressInput {
  /** Post office. Max length 100 characters. */
  readonly postOffice?: InputMaybe<Scalars['String']['input']>;
  /** Finnish postal code, exactly five digits. */
  readonly postalCode?: InputMaybe<Scalars['String']['input']>;
  /** Street address with possible house number etc. Max length 100 characters. */
  readonly streetAddress?: InputMaybe<Scalars['String']['input']>;
}

export interface VerifiedPersonalInformationForeignAddressInput {
  /** Additional address information, perhaps town, county, state, country etc. Max length 100 characters. */
  readonly additionalAddress?: InputMaybe<Scalars['String']['input']>;
  /** An ISO 3166-1 country code. */
  readonly countryCode?: InputMaybe<Scalars['String']['input']>;
  /** Street address or whatever is the _first part_ of the address. Max length 100 characters. */
  readonly streetAddress?: InputMaybe<Scalars['String']['input']>;
}

export interface VerifiedPersonalInformationInput {
  /** First name(s). Max length 100 characters. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** The name the person is called with. Max length 100 characters. */
  readonly givenName?: InputMaybe<Scalars['String']['input']>;
  /** Last name. Max length 100 characters. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** Official municipality of residence in Finland as a free form text. Max length 100 characters. */
  readonly municipalityOfResidence?: InputMaybe<Scalars['String']['input']>;
  /** Official municipality of residence in Finland as an official number, exactly three digits. */
  readonly municipalityOfResidenceNumber?: InputMaybe<Scalars['String']['input']>;
  /** Finnish personal identity code. */
  readonly nationalIdentificationNumber?: InputMaybe<Scalars['String']['input']>;
  /** The permanent residency address in Finland. */
  readonly permanentAddress?: InputMaybe<VerifiedPersonalInformationAddressInput>;
  /** The temporary foreign (i.e. not in Finland) residency address. */
  readonly permanentForeignAddress?: InputMaybe<VerifiedPersonalInformationForeignAddressInput>;
  /** The temporary residency address in Finland. */
  readonly temporaryAddress?: InputMaybe<VerifiedPersonalInformationAddressInput>;
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

export type GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeServiceFragment = { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string, readonly isPureKeycloak: boolean };

export type GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeFragment = { readonly __typename: 'ServiceConnectionType', readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string, readonly isPureKeycloak: boolean } };

export type GdprServiceConnectionsQueryMyProfileServiceConnectionsFragment = { readonly __typename: 'ServiceConnectionTypeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ServiceConnectionTypeEdge', readonly node: { readonly __typename: 'ServiceConnectionType', readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string, readonly isPureKeycloak: boolean } } | null } | null> };

export type GdprServiceConnectionsQueryMyProfileFragment = { readonly __typename: 'ProfileNode', readonly id: string, readonly serviceConnections: { readonly __typename: 'ServiceConnectionTypeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ServiceConnectionTypeEdge', readonly node: { readonly __typename: 'ServiceConnectionType', readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string, readonly isPureKeycloak: boolean } } | null } | null> } | null };

export type GdprServiceConnectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GdprServiceConnectionsQuery = { readonly myProfile: { readonly __typename: 'ProfileNode', readonly id: string, readonly serviceConnections: { readonly __typename: 'ServiceConnectionTypeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ServiceConnectionTypeEdge', readonly node: { readonly __typename: 'ServiceConnectionType', readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string, readonly isPureKeycloak: boolean } } | null } | null> } | null } | null };

export type CreateMyProfileMutationVariables = Exact<{
  input: CreateMyProfileMutationInput;
}>;


export type CreateMyProfileMutation = { readonly createMyProfile: { readonly __typename: 'CreateMyProfileMutationPayload', readonly profile: { readonly __typename: 'ProfileNode', readonly id: string } | null } | null };

export type DownloadMyProfileQueryVariables = Exact<{
  authorizationCode: Scalars['String']['input'];
  authorizationCodeKeycloak?: InputMaybe<Scalars['String']['input']>;
}>;


export type DownloadMyProfileQuery = { readonly downloadMyProfile: any | null };

export type MyProfileQueryVerifiedPersonalInformationPermanentForeignAddressFragment = { readonly __typename: 'VerifiedPersonalInformationForeignAddressNode', readonly streetAddress: string, readonly additionalAddress: string, readonly countryCode: string };

export type MyProfileQueryVerifiedPersonalInformationPermanentAddressFragment = { readonly __typename: 'VerifiedPersonalInformationAddressNode', readonly streetAddress: string, readonly postalCode: string, readonly postOffice: string };

export type MyProfileQueryVerifiedPersonalInformationFragment = { readonly __typename: 'VerifiedPersonalInformationNode', readonly firstName: string, readonly lastName: string, readonly givenName: string, readonly nationalIdentificationNumber: string, readonly municipalityOfResidence: string, readonly municipalityOfResidenceNumber: string, readonly permanentAddress: { readonly __typename: 'VerifiedPersonalInformationAddressNode', readonly streetAddress: string, readonly postalCode: string, readonly postOffice: string } | null, readonly permanentForeignAddress: { readonly __typename: 'VerifiedPersonalInformationForeignAddressNode', readonly streetAddress: string, readonly additionalAddress: string, readonly countryCode: string } | null };

export type MyProfileQueryPrimaryAddressFragment = { readonly __typename: 'AddressNode', readonly id: string, readonly primary: boolean, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null };

export type MyProfileQueryPrimaryEmailFragment = { readonly __typename: 'EmailNode', readonly id: string, readonly email: string, readonly primary: boolean, readonly emailType: EmailType | null };

export type MyProfileQueryPrimaryPhoneFragment = { readonly __typename: 'PhoneNode', readonly id: string, readonly phone: string, readonly primary: boolean, readonly phoneType: PhoneType | null };

export type MyProfileQueryAddressesEdgesNodeFragment = { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null };

export type MyProfileQueryEmailsEdgesNodeFragment = { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null };

export type MyProfileQueryPhonesEdgesNodeFragment = { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null };

export type MyProfileQueryAddressesEdgesFragment = { readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null };

export type MyProfileQueryEmailsEdgesFragment = { readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null };

export type MyProfileQueryPhonesEdgesFragment = { readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null };

export type MyProfileQueryAddressesFragment = { readonly __typename: 'AddressNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null } | null> };

export type MyProfileQueryEmailsFragment = { readonly __typename: 'EmailNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null } | null> };

export type MyProfileQueryPhonesFragment = { readonly __typename: 'PhoneNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null } | null> };

export type MyProfileQueryFragment = { readonly __typename: 'ProfileNode', readonly id: string, readonly firstName: string, readonly lastName: string, readonly nickname: string, readonly language: Language | null, readonly primaryAddress: { readonly __typename: 'AddressNode', readonly id: string, readonly primary: boolean, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null, readonly addresses: { readonly __typename: 'AddressNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null } | null> } | null, readonly primaryEmail: { readonly __typename: 'EmailNode', readonly id: string, readonly email: string, readonly primary: boolean, readonly emailType: EmailType | null } | null, readonly emails: { readonly __typename: 'EmailNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null } | null> } | null, readonly primaryPhone: { readonly __typename: 'PhoneNode', readonly id: string, readonly phone: string, readonly primary: boolean, readonly phoneType: PhoneType | null } | null, readonly phones: { readonly __typename: 'PhoneNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null } | null> } | null, readonly verifiedPersonalInformation: { readonly __typename: 'VerifiedPersonalInformationNode', readonly firstName: string, readonly lastName: string, readonly givenName: string, readonly nationalIdentificationNumber: string, readonly municipalityOfResidence: string, readonly municipalityOfResidenceNumber: string, readonly permanentAddress: { readonly __typename: 'VerifiedPersonalInformationAddressNode', readonly streetAddress: string, readonly postalCode: string, readonly postOffice: string } | null, readonly permanentForeignAddress: { readonly __typename: 'VerifiedPersonalInformationForeignAddressNode', readonly streetAddress: string, readonly additionalAddress: string, readonly countryCode: string } | null } | null };

export type MyProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type MyProfileQuery = { readonly myProfile: { readonly __typename: 'ProfileNode', readonly id: string, readonly firstName: string, readonly lastName: string, readonly nickname: string, readonly language: Language | null, readonly primaryAddress: { readonly __typename: 'AddressNode', readonly id: string, readonly primary: boolean, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null, readonly addresses: { readonly __typename: 'AddressNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null } | null> } | null, readonly primaryEmail: { readonly __typename: 'EmailNode', readonly id: string, readonly email: string, readonly primary: boolean, readonly emailType: EmailType | null } | null, readonly emails: { readonly __typename: 'EmailNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null } | null> } | null, readonly primaryPhone: { readonly __typename: 'PhoneNode', readonly id: string, readonly phone: string, readonly primary: boolean, readonly phoneType: PhoneType | null } | null, readonly phones: { readonly __typename: 'PhoneNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null } | null> } | null, readonly verifiedPersonalInformation: { readonly __typename: 'VerifiedPersonalInformationNode', readonly firstName: string, readonly lastName: string, readonly givenName: string, readonly nationalIdentificationNumber: string, readonly municipalityOfResidence: string, readonly municipalityOfResidenceNumber: string, readonly permanentAddress: { readonly __typename: 'VerifiedPersonalInformationAddressNode', readonly streetAddress: string, readonly postalCode: string, readonly postOffice: string } | null, readonly permanentForeignAddress: { readonly __typename: 'VerifiedPersonalInformationForeignAddressNode', readonly streetAddress: string, readonly additionalAddress: string, readonly countryCode: string } | null } | null } | null };

export type NameQueryVariables = Exact<{ [key: string]: never; }>;


export type NameQuery = { readonly myProfile: { readonly __typename: 'ProfileNode', readonly firstName: string, readonly lastName: string, readonly nickname: string } | null };

export type ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesNodeFragment = { readonly __typename: 'AllowedDataFieldNode', readonly fieldName: string, readonly label: string | null };

export type ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesFragment = { readonly __typename: 'AllowedDataFieldNodeEdge', readonly node: { readonly __typename: 'AllowedDataFieldNode', readonly fieldName: string, readonly label: string | null } | null };

export type ServiceConnectionsQueryEdgesNodeServiceFragment = { readonly __typename: 'ServiceNode', readonly name: string, readonly title: string | null, readonly description: string | null, readonly isPureKeycloak: boolean, readonly allowedDataFields: { readonly __typename: 'AllowedDataFieldNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AllowedDataFieldNodeEdge', readonly node: { readonly __typename: 'AllowedDataFieldNode', readonly fieldName: string, readonly label: string | null } | null } | null> } };

export type ServiceConnectionsQueryEdgesNodeFragment = { readonly __typename: 'ServiceConnectionType', readonly createdAt: any, readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly title: string | null, readonly description: string | null, readonly isPureKeycloak: boolean, readonly allowedDataFields: { readonly __typename: 'AllowedDataFieldNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AllowedDataFieldNodeEdge', readonly node: { readonly __typename: 'AllowedDataFieldNode', readonly fieldName: string, readonly label: string | null } | null } | null> } } };

export type ServiceConnectionsQueryVariables = Exact<{
  language: TranslationLanguage;
}>;


export type ServiceConnectionsQuery = { readonly myProfile: { readonly __typename: 'ProfileNode', readonly id: string, readonly serviceConnections: { readonly __typename: 'ServiceConnectionTypeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ServiceConnectionTypeEdge', readonly node: { readonly __typename: 'ServiceConnectionType', readonly createdAt: any, readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly title: string | null, readonly description: string | null, readonly isPureKeycloak: boolean, readonly allowedDataFields: { readonly __typename: 'AllowedDataFieldNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AllowedDataFieldNodeEdge', readonly node: { readonly __typename: 'AllowedDataFieldNode', readonly fieldName: string, readonly label: string | null } | null } | null> } } } | null } | null> } | null } | null };

export type UpdateMyProfileMutationFragment = { readonly __typename: 'ProfileNode', readonly id: string, readonly firstName: string, readonly lastName: string, readonly nickname: string, readonly language: Language | null, readonly primaryAddress: { readonly __typename: 'AddressNode', readonly id: string, readonly primary: boolean, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null, readonly addresses: { readonly __typename: 'AddressNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null } | null> } | null, readonly primaryEmail: { readonly __typename: 'EmailNode', readonly id: string, readonly email: string, readonly primary: boolean, readonly emailType: EmailType | null } | null, readonly emails: { readonly __typename: 'EmailNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null } | null> } | null, readonly primaryPhone: { readonly __typename: 'PhoneNode', readonly id: string, readonly phone: string, readonly primary: boolean, readonly phoneType: PhoneType | null } | null, readonly phones: { readonly __typename: 'PhoneNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null } | null> } | null };

export type UpdateMyProfileMutationVariables = Exact<{
  input: UpdateMyProfileMutationInput;
}>;


export type UpdateMyProfileMutation = { readonly updateMyProfile: { readonly __typename: 'UpdateMyProfileMutationPayload', readonly profile: { readonly __typename: 'ProfileNode', readonly id: string, readonly firstName: string, readonly lastName: string, readonly nickname: string, readonly language: Language | null, readonly primaryAddress: { readonly __typename: 'AddressNode', readonly id: string, readonly primary: boolean, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null, readonly addresses: { readonly __typename: 'AddressNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null } | null> } | null, readonly primaryEmail: { readonly __typename: 'EmailNode', readonly id: string, readonly email: string, readonly primary: boolean, readonly emailType: EmailType | null } | null, readonly emails: { readonly __typename: 'EmailNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null } | null> } | null, readonly primaryPhone: { readonly __typename: 'PhoneNode', readonly id: string, readonly phone: string, readonly primary: boolean, readonly phoneType: PhoneType | null } | null, readonly phones: { readonly __typename: 'PhoneNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null } | null> } | null } | null } | null };

export const GdprDeleteMyProfileMutationDeleteMyProfileResultsErrorsFragmentDoc = gql`
    fragment GdprDeleteMyProfileMutationDeleteMyProfileResultsErrors on ServiceConnectionDeletionError {
  code
}
    `;
export const GdprDeleteMyProfileMutationDeleteMyProfileResultsFragmentDoc = gql`
    fragment GdprDeleteMyProfileMutationDeleteMyProfileResults on ServiceConnectionDeletionResult {
  success
  errors {
    ...GdprDeleteMyProfileMutationDeleteMyProfileResultsErrors
  }
  service {
    name
    title(language: $language)
  }
}
    ${GdprDeleteMyProfileMutationDeleteMyProfileResultsErrorsFragmentDoc}`;
export const GdprDeleteMyProfileMutationDeleteMyProfileFragmentDoc = gql`
    fragment GdprDeleteMyProfileMutationDeleteMyProfile on DeleteMyProfileMutationPayload {
  results {
    ...GdprDeleteMyProfileMutationDeleteMyProfileResults
  }
}
    ${GdprDeleteMyProfileMutationDeleteMyProfileResultsFragmentDoc}`;
export const GdprDeleteMyServiceDataMutationFragmentDoc = gql`
    fragment GdprDeleteMyServiceDataMutation on ServiceConnectionDeletionResult {
  success
  errors {
    code
  }
}
    `;
export const GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeServiceFragmentDoc = gql`
    fragment GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeService on ServiceNode {
  name
  gdprQueryScope
  gdprDeleteScope
  isPureKeycloak
}
    `;
export const GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeFragmentDoc = gql`
    fragment GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNode on ServiceConnectionType {
  service {
    ...GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeService
  }
}
    ${GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeServiceFragmentDoc}`;
export const GdprServiceConnectionsQueryMyProfileServiceConnectionsFragmentDoc = gql`
    fragment GdprServiceConnectionsQueryMyProfileServiceConnections on ServiceConnectionTypeConnection {
  edges {
    node {
      ...GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNode
    }
  }
}
    ${GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeFragmentDoc}`;
export const GdprServiceConnectionsQueryMyProfileFragmentDoc = gql`
    fragment GdprServiceConnectionsQueryMyProfile on ProfileNode {
  id
  serviceConnections {
    ...GdprServiceConnectionsQueryMyProfileServiceConnections
  }
}
    ${GdprServiceConnectionsQueryMyProfileServiceConnectionsFragmentDoc}`;
export const MyProfileQueryPrimaryAddressFragmentDoc = gql`
    fragment MyProfileQueryPrimaryAddress on AddressNode {
  id
  primary
  address
  postalCode
  city
  countryCode
  addressType
}
    `;
export const MyProfileQueryAddressesEdgesNodeFragmentDoc = gql`
    fragment MyProfileQueryAddressesEdgesNode on AddressNode {
  primary
  id
  address
  postalCode
  city
  countryCode
  addressType
}
    `;
export const MyProfileQueryAddressesEdgesFragmentDoc = gql`
    fragment MyProfileQueryAddressesEdges on AddressNodeEdge {
  node {
    ...MyProfileQueryAddressesEdgesNode
  }
}
    ${MyProfileQueryAddressesEdgesNodeFragmentDoc}`;
export const MyProfileQueryAddressesFragmentDoc = gql`
    fragment MyProfileQueryAddresses on AddressNodeConnection {
  edges {
    ...MyProfileQueryAddressesEdges
  }
}
    ${MyProfileQueryAddressesEdgesFragmentDoc}`;
export const MyProfileQueryPrimaryEmailFragmentDoc = gql`
    fragment MyProfileQueryPrimaryEmail on EmailNode {
  id
  email
  primary
  emailType
}
    `;
export const MyProfileQueryEmailsEdgesNodeFragmentDoc = gql`
    fragment MyProfileQueryEmailsEdgesNode on EmailNode {
  primary
  id
  email
  emailType
}
    `;
export const MyProfileQueryEmailsEdgesFragmentDoc = gql`
    fragment MyProfileQueryEmailsEdges on EmailNodeEdge {
  node {
    ...MyProfileQueryEmailsEdgesNode
  }
}
    ${MyProfileQueryEmailsEdgesNodeFragmentDoc}`;
export const MyProfileQueryEmailsFragmentDoc = gql`
    fragment MyProfileQueryEmails on EmailNodeConnection {
  edges {
    ...MyProfileQueryEmailsEdges
  }
}
    ${MyProfileQueryEmailsEdgesFragmentDoc}`;
export const MyProfileQueryPrimaryPhoneFragmentDoc = gql`
    fragment MyProfileQueryPrimaryPhone on PhoneNode {
  id
  phone
  primary
  phoneType
}
    `;
export const MyProfileQueryPhonesEdgesNodeFragmentDoc = gql`
    fragment MyProfileQueryPhonesEdgesNode on PhoneNode {
  primary
  id
  phone
  phoneType
}
    `;
export const MyProfileQueryPhonesEdgesFragmentDoc = gql`
    fragment MyProfileQueryPhonesEdges on PhoneNodeEdge {
  node {
    ...MyProfileQueryPhonesEdgesNode
  }
}
    ${MyProfileQueryPhonesEdgesNodeFragmentDoc}`;
export const MyProfileQueryPhonesFragmentDoc = gql`
    fragment MyProfileQueryPhones on PhoneNodeConnection {
  edges {
    ...MyProfileQueryPhonesEdges
  }
}
    ${MyProfileQueryPhonesEdgesFragmentDoc}`;
export const MyProfileQueryVerifiedPersonalInformationPermanentAddressFragmentDoc = gql`
    fragment MyProfileQueryVerifiedPersonalInformationPermanentAddress on VerifiedPersonalInformationAddressNode {
  streetAddress
  postalCode
  postOffice
}
    `;
export const MyProfileQueryVerifiedPersonalInformationPermanentForeignAddressFragmentDoc = gql`
    fragment MyProfileQueryVerifiedPersonalInformationPermanentForeignAddress on VerifiedPersonalInformationForeignAddressNode {
  streetAddress
  additionalAddress
  countryCode
}
    `;
export const MyProfileQueryVerifiedPersonalInformationFragmentDoc = gql`
    fragment MyProfileQueryVerifiedPersonalInformation on VerifiedPersonalInformationNode {
  firstName
  lastName
  givenName
  nationalIdentificationNumber
  municipalityOfResidence
  municipalityOfResidenceNumber
  permanentAddress {
    ...MyProfileQueryVerifiedPersonalInformationPermanentAddress
  }
  permanentForeignAddress {
    ...MyProfileQueryVerifiedPersonalInformationPermanentForeignAddress
  }
}
    ${MyProfileQueryVerifiedPersonalInformationPermanentAddressFragmentDoc}
${MyProfileQueryVerifiedPersonalInformationPermanentForeignAddressFragmentDoc}`;
export const MyProfileQueryFragmentDoc = gql`
    fragment MyProfileQuery on ProfileNode {
  id
  firstName
  lastName
  nickname
  language
  primaryAddress {
    ...MyProfileQueryPrimaryAddress
  }
  addresses {
    ...MyProfileQueryAddresses
  }
  primaryEmail {
    ...MyProfileQueryPrimaryEmail
  }
  emails {
    ...MyProfileQueryEmails
  }
  primaryPhone {
    ...MyProfileQueryPrimaryPhone
  }
  phones {
    ...MyProfileQueryPhones
  }
  verifiedPersonalInformation {
    ...MyProfileQueryVerifiedPersonalInformation
  }
}
    ${MyProfileQueryPrimaryAddressFragmentDoc}
${MyProfileQueryAddressesFragmentDoc}
${MyProfileQueryPrimaryEmailFragmentDoc}
${MyProfileQueryEmailsFragmentDoc}
${MyProfileQueryPrimaryPhoneFragmentDoc}
${MyProfileQueryPhonesFragmentDoc}
${MyProfileQueryVerifiedPersonalInformationFragmentDoc}`;
export const ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesNodeFragmentDoc = gql`
    fragment ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesNode on AllowedDataFieldNode {
  fieldName
  label(language: $language)
}
    `;
export const ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesFragmentDoc = gql`
    fragment ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdges on AllowedDataFieldNodeEdge {
  node {
    ...ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesNode
  }
}
    ${ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesNodeFragmentDoc}`;
export const ServiceConnectionsQueryEdgesNodeServiceFragmentDoc = gql`
    fragment ServiceConnectionsQueryEdgesNodeService on ServiceNode {
  name
  title(language: $language)
  description(language: $language)
  allowedDataFields {
    edges {
      ...ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdges
    }
  }
  isPureKeycloak
}
    ${ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesFragmentDoc}`;
export const ServiceConnectionsQueryEdgesNodeFragmentDoc = gql`
    fragment ServiceConnectionsQueryEdgesNode on ServiceConnectionType {
  service {
    ...ServiceConnectionsQueryEdgesNodeService
  }
  createdAt
}
    ${ServiceConnectionsQueryEdgesNodeServiceFragmentDoc}`;
export const UpdateMyProfileMutationFragmentDoc = gql`
    fragment UpdateMyProfileMutation on ProfileNode {
  id
  firstName
  lastName
  nickname
  language
  primaryAddress {
    id
    primary
    address
    postalCode
    city
    countryCode
    addressType
  }
  addresses {
    edges {
      node {
        primary
        id
        address
        postalCode
        city
        countryCode
        addressType
      }
    }
  }
  primaryEmail {
    id
    email
    primary
    emailType
  }
  emails {
    edges {
      node {
        primary
        id
        email
        emailType
      }
    }
  }
  primaryPhone {
    id
    phone
    primary
    phoneType
  }
  phones {
    edges {
      node {
        primary
        id
        phone
        phoneType
      }
    }
  }
}
    `;
export const GdprDeleteMyProfileDocument = gql`
    mutation GdprDeleteMyProfile($input: DeleteMyProfileMutationInput!, $language: TranslationLanguage!) {
  deleteMyProfile(input: $input) {
    ...GdprDeleteMyProfileMutationDeleteMyProfile
  }
}
    ${GdprDeleteMyProfileMutationDeleteMyProfileFragmentDoc}`;
export type GdprDeleteMyProfileMutationFn = Apollo.MutationFunction<GdprDeleteMyProfileMutation, GdprDeleteMyProfileMutationVariables>;

/**
 * __useGdprDeleteMyProfileMutation__
 *
 * To run a mutation, you first call `useGdprDeleteMyProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGdprDeleteMyProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [gdprDeleteMyProfileMutation, { data, loading, error }] = useGdprDeleteMyProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *      language: // value for 'language'
 *   },
 * });
 */
export function useGdprDeleteMyProfileMutation(baseOptions?: Apollo.MutationHookOptions<GdprDeleteMyProfileMutation, GdprDeleteMyProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GdprDeleteMyProfileMutation, GdprDeleteMyProfileMutationVariables>(GdprDeleteMyProfileDocument, options);
      }
export type GdprDeleteMyProfileMutationHookResult = ReturnType<typeof useGdprDeleteMyProfileMutation>;
export type GdprDeleteMyProfileMutationResult = Apollo.MutationResult<GdprDeleteMyProfileMutation>;
export type GdprDeleteMyProfileMutationOptions = Apollo.BaseMutationOptions<GdprDeleteMyProfileMutation, GdprDeleteMyProfileMutationVariables>;
export const GdprDeleteMyServiceDataDocument = gql`
    mutation GdprDeleteMyServiceData($input: DeleteMyServiceDataMutationInput!) {
  deleteMyServiceData(input: $input) {
    result {
      ...GdprDeleteMyServiceDataMutation
    }
  }
}
    ${GdprDeleteMyServiceDataMutationFragmentDoc}`;
export type GdprDeleteMyServiceDataMutationFn = Apollo.MutationFunction<GdprDeleteMyServiceDataMutation, GdprDeleteMyServiceDataMutationVariables>;

/**
 * __useGdprDeleteMyServiceDataMutation__
 *
 * To run a mutation, you first call `useGdprDeleteMyServiceDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGdprDeleteMyServiceDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [gdprDeleteMyServiceDataMutation, { data, loading, error }] = useGdprDeleteMyServiceDataMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGdprDeleteMyServiceDataMutation(baseOptions?: Apollo.MutationHookOptions<GdprDeleteMyServiceDataMutation, GdprDeleteMyServiceDataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GdprDeleteMyServiceDataMutation, GdprDeleteMyServiceDataMutationVariables>(GdprDeleteMyServiceDataDocument, options);
      }
export type GdprDeleteMyServiceDataMutationHookResult = ReturnType<typeof useGdprDeleteMyServiceDataMutation>;
export type GdprDeleteMyServiceDataMutationResult = Apollo.MutationResult<GdprDeleteMyServiceDataMutation>;
export type GdprDeleteMyServiceDataMutationOptions = Apollo.BaseMutationOptions<GdprDeleteMyServiceDataMutation, GdprDeleteMyServiceDataMutationVariables>;
export const GdprServiceConnectionsDocument = gql`
    query GdprServiceConnections {
  myProfile {
    ...GdprServiceConnectionsQueryMyProfile
  }
}
    ${GdprServiceConnectionsQueryMyProfileFragmentDoc}`;

/**
 * __useGdprServiceConnectionsQuery__
 *
 * To run a query within a React component, call `useGdprServiceConnectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGdprServiceConnectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGdprServiceConnectionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGdprServiceConnectionsQuery(baseOptions?: Apollo.QueryHookOptions<GdprServiceConnectionsQuery, GdprServiceConnectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GdprServiceConnectionsQuery, GdprServiceConnectionsQueryVariables>(GdprServiceConnectionsDocument, options);
      }
export function useGdprServiceConnectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GdprServiceConnectionsQuery, GdprServiceConnectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GdprServiceConnectionsQuery, GdprServiceConnectionsQueryVariables>(GdprServiceConnectionsDocument, options);
        }
export function useGdprServiceConnectionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GdprServiceConnectionsQuery, GdprServiceConnectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GdprServiceConnectionsQuery, GdprServiceConnectionsQueryVariables>(GdprServiceConnectionsDocument, options);
        }
export type GdprServiceConnectionsQueryHookResult = ReturnType<typeof useGdprServiceConnectionsQuery>;
export type GdprServiceConnectionsLazyQueryHookResult = ReturnType<typeof useGdprServiceConnectionsLazyQuery>;
export type GdprServiceConnectionsSuspenseQueryHookResult = ReturnType<typeof useGdprServiceConnectionsSuspenseQuery>;
export type GdprServiceConnectionsQueryResult = Apollo.QueryResult<GdprServiceConnectionsQuery, GdprServiceConnectionsQueryVariables>;
export const CreateMyProfileDocument = gql`
    mutation CreateMyProfile($input: CreateMyProfileMutationInput!) {
  createMyProfile(input: $input) {
    profile {
      id
    }
  }
}
    `;
export type CreateMyProfileMutationFn = Apollo.MutationFunction<CreateMyProfileMutation, CreateMyProfileMutationVariables>;

/**
 * __useCreateMyProfileMutation__
 *
 * To run a mutation, you first call `useCreateMyProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateMyProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createMyProfileMutation, { data, loading, error }] = useCreateMyProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateMyProfileMutation(baseOptions?: Apollo.MutationHookOptions<CreateMyProfileMutation, CreateMyProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateMyProfileMutation, CreateMyProfileMutationVariables>(CreateMyProfileDocument, options);
      }
export type CreateMyProfileMutationHookResult = ReturnType<typeof useCreateMyProfileMutation>;
export type CreateMyProfileMutationResult = Apollo.MutationResult<CreateMyProfileMutation>;
export type CreateMyProfileMutationOptions = Apollo.BaseMutationOptions<CreateMyProfileMutation, CreateMyProfileMutationVariables>;
export const DownloadMyProfileDocument = gql`
    query DownloadMyProfile($authorizationCode: String!, $authorizationCodeKeycloak: String) {
  downloadMyProfile(
    authorizationCode: $authorizationCode
    authorizationCodeKeycloak: $authorizationCodeKeycloak
  )
}
    `;

/**
 * __useDownloadMyProfileQuery__
 *
 * To run a query within a React component, call `useDownloadMyProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useDownloadMyProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDownloadMyProfileQuery({
 *   variables: {
 *      authorizationCode: // value for 'authorizationCode'
 *      authorizationCodeKeycloak: // value for 'authorizationCodeKeycloak'
 *   },
 * });
 */
export function useDownloadMyProfileQuery(baseOptions: Apollo.QueryHookOptions<DownloadMyProfileQuery, DownloadMyProfileQueryVariables> & ({ variables: DownloadMyProfileQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DownloadMyProfileQuery, DownloadMyProfileQueryVariables>(DownloadMyProfileDocument, options);
      }
export function useDownloadMyProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DownloadMyProfileQuery, DownloadMyProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DownloadMyProfileQuery, DownloadMyProfileQueryVariables>(DownloadMyProfileDocument, options);
        }
export function useDownloadMyProfileSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<DownloadMyProfileQuery, DownloadMyProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DownloadMyProfileQuery, DownloadMyProfileQueryVariables>(DownloadMyProfileDocument, options);
        }
export type DownloadMyProfileQueryHookResult = ReturnType<typeof useDownloadMyProfileQuery>;
export type DownloadMyProfileLazyQueryHookResult = ReturnType<typeof useDownloadMyProfileLazyQuery>;
export type DownloadMyProfileSuspenseQueryHookResult = ReturnType<typeof useDownloadMyProfileSuspenseQuery>;
export type DownloadMyProfileQueryResult = Apollo.QueryResult<DownloadMyProfileQuery, DownloadMyProfileQueryVariables>;
export const MyProfileDocument = gql`
    query MyProfile {
  myProfile {
    ...MyProfileQuery
  }
}
    ${MyProfileQueryFragmentDoc}`;

/**
 * __useMyProfileQuery__
 *
 * To run a query within a React component, call `useMyProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyProfileQuery(baseOptions?: Apollo.QueryHookOptions<MyProfileQuery, MyProfileQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyProfileQuery, MyProfileQueryVariables>(MyProfileDocument, options);
      }
export function useMyProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyProfileQuery, MyProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyProfileQuery, MyProfileQueryVariables>(MyProfileDocument, options);
        }
export function useMyProfileSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyProfileQuery, MyProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyProfileQuery, MyProfileQueryVariables>(MyProfileDocument, options);
        }
export type MyProfileQueryHookResult = ReturnType<typeof useMyProfileQuery>;
export type MyProfileLazyQueryHookResult = ReturnType<typeof useMyProfileLazyQuery>;
export type MyProfileSuspenseQueryHookResult = ReturnType<typeof useMyProfileSuspenseQuery>;
export type MyProfileQueryResult = Apollo.QueryResult<MyProfileQuery, MyProfileQueryVariables>;
export const NameDocument = gql`
    query Name {
  myProfile {
    firstName
    lastName
    nickname
  }
}
    `;

/**
 * __useNameQuery__
 *
 * To run a query within a React component, call `useNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNameQuery({
 *   variables: {
 *   },
 * });
 */
export function useNameQuery(baseOptions?: Apollo.QueryHookOptions<NameQuery, NameQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NameQuery, NameQueryVariables>(NameDocument, options);
      }
export function useNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NameQuery, NameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NameQuery, NameQueryVariables>(NameDocument, options);
        }
export function useNameSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<NameQuery, NameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<NameQuery, NameQueryVariables>(NameDocument, options);
        }
export type NameQueryHookResult = ReturnType<typeof useNameQuery>;
export type NameLazyQueryHookResult = ReturnType<typeof useNameLazyQuery>;
export type NameSuspenseQueryHookResult = ReturnType<typeof useNameSuspenseQuery>;
export type NameQueryResult = Apollo.QueryResult<NameQuery, NameQueryVariables>;
export const ServiceConnectionsDocument = gql`
    query ServiceConnections($language: TranslationLanguage!) {
  myProfile {
    id
    serviceConnections {
      edges {
        node {
          ...ServiceConnectionsQueryEdgesNode
        }
      }
    }
  }
}
    ${ServiceConnectionsQueryEdgesNodeFragmentDoc}`;

/**
 * __useServiceConnectionsQuery__
 *
 * To run a query within a React component, call `useServiceConnectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useServiceConnectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServiceConnectionsQuery({
 *   variables: {
 *      language: // value for 'language'
 *   },
 * });
 */
export function useServiceConnectionsQuery(baseOptions: Apollo.QueryHookOptions<ServiceConnectionsQuery, ServiceConnectionsQueryVariables> & ({ variables: ServiceConnectionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ServiceConnectionsQuery, ServiceConnectionsQueryVariables>(ServiceConnectionsDocument, options);
      }
export function useServiceConnectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ServiceConnectionsQuery, ServiceConnectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ServiceConnectionsQuery, ServiceConnectionsQueryVariables>(ServiceConnectionsDocument, options);
        }
export function useServiceConnectionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ServiceConnectionsQuery, ServiceConnectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ServiceConnectionsQuery, ServiceConnectionsQueryVariables>(ServiceConnectionsDocument, options);
        }
export type ServiceConnectionsQueryHookResult = ReturnType<typeof useServiceConnectionsQuery>;
export type ServiceConnectionsLazyQueryHookResult = ReturnType<typeof useServiceConnectionsLazyQuery>;
export type ServiceConnectionsSuspenseQueryHookResult = ReturnType<typeof useServiceConnectionsSuspenseQuery>;
export type ServiceConnectionsQueryResult = Apollo.QueryResult<ServiceConnectionsQuery, ServiceConnectionsQueryVariables>;
export const UpdateMyProfileDocument = gql`
    mutation UpdateMyProfile($input: UpdateMyProfileMutationInput!) {
  updateMyProfile(input: $input) {
    profile {
      ...UpdateMyProfileMutation
    }
  }
}
    ${UpdateMyProfileMutationFragmentDoc}`;
export type UpdateMyProfileMutationFn = Apollo.MutationFunction<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;

/**
 * __useUpdateMyProfileMutation__
 *
 * To run a mutation, you first call `useUpdateMyProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMyProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMyProfileMutation, { data, loading, error }] = useUpdateMyProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateMyProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>(UpdateMyProfileDocument, options);
      }
export type UpdateMyProfileMutationHookResult = ReturnType<typeof useUpdateMyProfileMutation>;
export type UpdateMyProfileMutationResult = Apollo.MutationResult<UpdateMyProfileMutation>;
export type UpdateMyProfileMutationOptions = Apollo.BaseMutationOptions<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;