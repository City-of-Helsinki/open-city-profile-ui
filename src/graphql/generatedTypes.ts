/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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
  /** OAuth/OIDC authorization code from Keycloak */
  readonly authorizationCode: Scalars['String']['input'];
  readonly clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** Can be used to see if the profile can be removed. Default is False. */
  readonly dryRun?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface DeleteMyServiceDataMutationInput {
  /** OAuth/OIDC authorization code from Keycloak */
  readonly authorizationCode: Scalars['String']['input'];
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

export type GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeServiceFragment = { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string };

export type GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeFragment = { readonly __typename: 'ServiceConnectionType', readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string } };

export type GdprServiceConnectionsQueryMyProfileServiceConnectionsFragment = { readonly __typename: 'ServiceConnectionTypeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ServiceConnectionTypeEdge', readonly node: { readonly __typename: 'ServiceConnectionType', readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string } } | null } | null> };

export type GdprServiceConnectionsQueryMyProfileFragment = { readonly __typename: 'ProfileNode', readonly id: string, readonly serviceConnections: { readonly __typename: 'ServiceConnectionTypeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ServiceConnectionTypeEdge', readonly node: { readonly __typename: 'ServiceConnectionType', readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string } } | null } | null> } | null };

export type GdprServiceConnectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GdprServiceConnectionsQuery = { readonly myProfile: { readonly __typename: 'ProfileNode', readonly id: string, readonly serviceConnections: { readonly __typename: 'ServiceConnectionTypeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ServiceConnectionTypeEdge', readonly node: { readonly __typename: 'ServiceConnectionType', readonly service: { readonly __typename: 'ServiceNode', readonly name: string, readonly gdprQueryScope: string, readonly gdprDeleteScope: string } } | null } | null> } | null } | null };

export type DownloadMyProfileQueryVariables = Exact<{
  authorizationCode: Scalars['String']['input'];
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

export type MyLoginMethodNodeFragment = { readonly __typename: 'LoginMethodNode', readonly method: LoginMethodType, readonly createdAt: any | null, readonly credentialId: string | null, readonly userLabel: string | null };

export type MyProfileQueryAddressesEdgesFragment = { readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null };

export type MyProfileQueryEmailsEdgesFragment = { readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null };

export type MyProfileQueryPhonesEdgesFragment = { readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null };

export type MyProfileQueryAddressesFragment = { readonly __typename: 'AddressNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null } | null> };

export type MyProfileQueryEmailsFragment = { readonly __typename: 'EmailNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null } | null> };

export type MyProfileQueryPhonesFragment = { readonly __typename: 'PhoneNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null } | null> };

export type MyProfileQueryFragment = { readonly __typename: 'ProfileNode', readonly id: string, readonly firstName: string, readonly lastName: string, readonly nickname: string, readonly language: Language | null, readonly availableLoginMethods: ReadonlyArray<{ readonly __typename: 'LoginMethodNode', readonly method: LoginMethodType, readonly createdAt: any | null, readonly credentialId: string | null, readonly userLabel: string | null } | null> | null, readonly primaryAddress: { readonly __typename: 'AddressNode', readonly id: string, readonly primary: boolean, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null, readonly addresses: { readonly __typename: 'AddressNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null } | null> } | null, readonly primaryEmail: { readonly __typename: 'EmailNode', readonly id: string, readonly email: string, readonly primary: boolean, readonly emailType: EmailType | null } | null, readonly emails: { readonly __typename: 'EmailNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null } | null> } | null, readonly primaryPhone: { readonly __typename: 'PhoneNode', readonly id: string, readonly phone: string, readonly primary: boolean, readonly phoneType: PhoneType | null } | null, readonly phones: { readonly __typename: 'PhoneNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null } | null> } | null, readonly verifiedPersonalInformation: { readonly __typename: 'VerifiedPersonalInformationNode', readonly firstName: string, readonly lastName: string, readonly givenName: string, readonly nationalIdentificationNumber: string, readonly municipalityOfResidence: string, readonly municipalityOfResidenceNumber: string, readonly permanentAddress: { readonly __typename: 'VerifiedPersonalInformationAddressNode', readonly streetAddress: string, readonly postalCode: string, readonly postOffice: string } | null, readonly permanentForeignAddress: { readonly __typename: 'VerifiedPersonalInformationForeignAddressNode', readonly streetAddress: string, readonly additionalAddress: string, readonly countryCode: string } | null } | null };

export type MyProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type MyProfileQuery = { readonly myProfile: { readonly __typename: 'ProfileNode', readonly id: string, readonly firstName: string, readonly lastName: string, readonly nickname: string, readonly language: Language | null, readonly availableLoginMethods: ReadonlyArray<{ readonly __typename: 'LoginMethodNode', readonly method: LoginMethodType, readonly createdAt: any | null, readonly credentialId: string | null, readonly userLabel: string | null } | null> | null, readonly primaryAddress: { readonly __typename: 'AddressNode', readonly id: string, readonly primary: boolean, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null, readonly addresses: { readonly __typename: 'AddressNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'AddressNodeEdge', readonly node: { readonly __typename: 'AddressNode', readonly primary: boolean, readonly id: string, readonly address: string, readonly postalCode: string, readonly city: string, readonly countryCode: string, readonly addressType: AddressType | null } | null } | null> } | null, readonly primaryEmail: { readonly __typename: 'EmailNode', readonly id: string, readonly email: string, readonly primary: boolean, readonly emailType: EmailType | null } | null, readonly emails: { readonly __typename: 'EmailNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'EmailNodeEdge', readonly node: { readonly __typename: 'EmailNode', readonly primary: boolean, readonly id: string, readonly email: string, readonly emailType: EmailType | null } | null } | null> } | null, readonly primaryPhone: { readonly __typename: 'PhoneNode', readonly id: string, readonly phone: string, readonly primary: boolean, readonly phoneType: PhoneType | null } | null, readonly phones: { readonly __typename: 'PhoneNodeConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'PhoneNodeEdge', readonly node: { readonly __typename: 'PhoneNode', readonly primary: boolean, readonly id: string, readonly phone: string, readonly phoneType: PhoneType | null } | null } | null> } | null, readonly verifiedPersonalInformation: { readonly __typename: 'VerifiedPersonalInformationNode', readonly firstName: string, readonly lastName: string, readonly givenName: string, readonly nationalIdentificationNumber: string, readonly municipalityOfResidence: string, readonly municipalityOfResidenceNumber: string, readonly permanentAddress: { readonly __typename: 'VerifiedPersonalInformationAddressNode', readonly streetAddress: string, readonly postalCode: string, readonly postOffice: string } | null, readonly permanentForeignAddress: { readonly __typename: 'VerifiedPersonalInformationForeignAddressNode', readonly streetAddress: string, readonly additionalAddress: string, readonly countryCode: string } | null } | null } | null };

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
