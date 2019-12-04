/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

/**
 * An enumeration.
 */
export enum ContactMethod {
  EMAIL = "EMAIL",
  SMS = "SMS",
}

/**
 * An enumeration.
 */
export enum Language {
  ENGLISH = "ENGLISH",
  FINNISH = "FINNISH",
  SWEDISH = "SWEDISH",
}

/**
 * An enumeration.
 */
export enum addressType {
  HOME = "HOME",
  OTHER = "OTHER",
  WORK = "WORK",
}

/**
 * An enumeration.
 */
export enum emailType {
  OTHER = "OTHER",
  PERSONAL = "PERSONAL",
  WORK = "WORK",
}

/**
 * An enumeration.
 */
export enum phoneType {
  HOME = "HOME",
  MOBILE = "MOBILE",
  OTHER = "OTHER",
  WORK = "WORK",
}

export interface AddressInput {
  readonly id?: string | null;
  readonly address?: string | null;
  readonly postalCode?: string | null;
  readonly city?: string | null;
  readonly countryCode?: string | null;
  readonly addressType?: addressType | null;
  readonly primary?: boolean | null;
}

export interface EmailInput {
  readonly id?: string | null;
  readonly email?: string | null;
  readonly emailType?: emailType | null;
  readonly primary?: boolean | null;
}

export interface PhoneInput {
  readonly id?: string | null;
  readonly phone?: string | null;
  readonly phoneType?: phoneType | null;
  readonly primary?: boolean | null;
}

export interface ProfileInput {
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly nickname?: string | null;
  readonly image?: string | null;
  readonly language?: Language | null;
  readonly contactMethod?: ContactMethod | null;
  readonly conceptsOfInterest?: ReadonlyArray<(string | null)> | null;
  readonly divisionsOfInterest?: ReadonlyArray<(string | null)> | null;
  readonly addEmails?: ReadonlyArray<(EmailInput | null)> | null;
  readonly updateEmails?: ReadonlyArray<(EmailInput | null)> | null;
  readonly removeEmails?: ReadonlyArray<(string | null)> | null;
  readonly addPhones?: ReadonlyArray<(PhoneInput | null)> | null;
  readonly updatePhones?: ReadonlyArray<(PhoneInput | null)> | null;
  readonly removePhones?: ReadonlyArray<(string | null)> | null;
  readonly addAddresses?: ReadonlyArray<(AddressInput | null)> | null;
  readonly updateAddresses?: ReadonlyArray<(AddressInput | null)> | null;
  readonly removeAddresses?: ReadonlyArray<(string | null)> | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
