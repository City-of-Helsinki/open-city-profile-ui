import {
  MyProfileQuery,
  MyProfileQueryVerifiedPersonalInformationFragment,
  MyProfileQueryFragment,
  MyProfileQueryAddressesFragment,
  MyProfileQueryAddressesEdgesFragment,
  MyProfileQueryAddressesEdgesNodeFragment,
  MyProfileQueryEmailsFragment,
  MyProfileQueryEmailsEdgesFragment,
  MyProfileQueryEmailsEdgesNodeFragment,
  MyProfileQueryPhonesFragment,
  MyProfileQueryPhonesEdgesFragment,
  MyProfileQueryPhonesEdgesNodeFragment,
  UpdateMyProfileMutation,
  UpdateMyProfileMutationFragment,
  ProfileInput as ProfileInputInterface,
  MyProfileQueryVerifiedPersonalInformationPermanentForeignAddressFragment,
  MyProfileQueryVerifiedPersonalInformationPermanentAddressFragment,
  ServiceConnectionsQuery,
  ServiceConnectionsQueryEdgesNodeFragment,
  ServiceConnectionsQueryEdgesNodeServiceFragment,
  ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesNodeFragment,
  GdprServiceConnectionsQuery,
  MyProfileQueryPrimaryAddressFragment,
  MyProfileQueryPrimaryEmailFragment,
  MyProfileQueryPrimaryPhoneFragment,
  ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesFragment,
  ServiceConnectionsQueryVariables as ServiceConnectionsQueryVars,
  GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeServiceFragment,
} from './generatedTypes';

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export type ProfileRoot = MyProfileQuery;
export type ProfileData = MyProfileQueryFragment;

export type UpdateProfileRoot = UpdateMyProfileMutation;
export type UpdateProfileData = UpdateMyProfileMutationFragment;

export type VerifiedPersonalInformation = MyProfileQueryVerifiedPersonalInformationFragment;

export type Addresses = MyProfileQueryAddressesFragment;
export type AddressEdge = MyProfileQueryAddressesEdgesFragment;
export type AddressNode = MyProfileQueryAddressesEdgesNodeFragment;

export type Emails = MyProfileQueryEmailsFragment;
export type EmailEdge = MyProfileQueryEmailsEdgesFragment;
export type EmailNode = MyProfileQueryEmailsEdgesNodeFragment;

export type Phones = MyProfileQueryPhonesFragment;
export type PhoneEdge = MyProfileQueryPhonesEdgesFragment;
export type PhoneNode = MyProfileQueryPhonesEdgesNodeFragment;

export type PrimaryAddress = MyProfileQueryPrimaryAddressFragment;
export type PrimaryEmail = MyProfileQueryPrimaryEmailFragment;
export type PrimaryPhone = MyProfileQueryPrimaryPhoneFragment;

export type InsertableEdge = AddressEdge | EmailEdge | PhoneEdge;
export type InsertableNode = AddressNode | EmailNode | PhoneNode;
export type EdgeList = (InsertableEdge | null)[];

export type MutableAddresses = Mutable<Addresses> & {
  edges: (Mutable<AddressEdge> | null)[];
};

export type MutableEmails = Mutable<Emails> & {
  edges: (Mutable<EmailEdge> | null)[];
};
export type MutablePhones = Mutable<Phones> & {
  edges: (Mutable<PhoneEdge> | null)[];
};

export type ProfileInput = ProfileInputInterface;

export type PermanentForeignAddress = MyProfileQueryVerifiedPersonalInformationPermanentForeignAddressFragment;
export type PermanentAddress = MyProfileQueryVerifiedPersonalInformationPermanentAddressFragment;

export type ServiceConnectionsRoot = ServiceConnectionsQuery;
export type ServiceConnectionsNode = ServiceConnectionsQueryEdgesNodeFragment;
export type Service = ServiceConnectionsQueryEdgesNodeServiceFragment;
export type ServiceConnectionsQueryVariables = ServiceConnectionsQueryVars;
// eslint-disable-next-line max-len
export type ServiceAllowedFieldsNode = ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesNodeFragment;
// eslint-disable-next-line max-len
export type ServiceAllowedFieldsEdge = ServiceConnectionsQueryEdgesNodeServiceAllowedDataFieldsEdgesFragment;
export type GdprServiceConnectionsRoot = GdprServiceConnectionsQuery;
// eslint-disable-next-line max-len
export type GdprServiceConnectionService = GdprServiceConnectionsQueryMyProfileServiceConnectionsEdgesNodeServiceFragment;

export {
  PhoneType,
  EmailType,
  AddressType,
  Language,
  TranslationLanguage,
} from './generatedTypes';

export type AnyObject<T = unknown> = Record<string, T>;
