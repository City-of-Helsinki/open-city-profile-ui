import {
  MyProfileQuery,
  MyProfileQuery_myProfile_verifiedPersonalInformation,
  MyProfileQuery_myProfile,
  MyProfileQuery_myProfile_addresses,
  MyProfileQuery_myProfile_addresses_edges,
  MyProfileQuery_myProfile_addresses_edges_node,
  MyProfileQuery_myProfile_emails,
  MyProfileQuery_myProfile_emails_edges,
  MyProfileQuery_myProfile_emails_edges_node,
  MyProfileQuery_myProfile_phones,
  MyProfileQuery_myProfile_phones_edges,
  MyProfileQuery_myProfile_phones_edges_node,
  UpdateMyProfile,
  UpdateMyProfile_updateMyProfile_profile,
  ProfileInput as ProfileInputInterface,
  MyProfileQuery_myProfile_verifiedPersonalInformation_permanentForeignAddress,
  MyProfileQuery_myProfile_verifiedPersonalInformation_permanentAddress,
  ServiceConnectionsQuery,
  ServiceConnectionsQuery_myProfile_serviceConnections_edges_node,
  ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service,
  ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service_allowedDataFields_edges_node,
  GdprServiceConnectionsQuery,
  MyProfileQuery_myProfile_primaryAddress,
  MyProfileQuery_myProfile_primaryEmail,
  MyProfileQuery_myProfile_primaryPhone,
  ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service_allowedDataFields_edges,
} from './generatedTypes';

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export type ProfileRoot = MyProfileQuery;
export type ProfileData = MyProfileQuery_myProfile;

export type UpdateProfileRoot = UpdateMyProfile;
export type UpdateProfileData = UpdateMyProfile_updateMyProfile_profile;

export type VerifiedPersonalInformation = MyProfileQuery_myProfile_verifiedPersonalInformation;

export type Addresses = MyProfileQuery_myProfile_addresses;
export type AddressEdge = MyProfileQuery_myProfile_addresses_edges;
export type AddressNode = MyProfileQuery_myProfile_addresses_edges_node;

export type Emails = MyProfileQuery_myProfile_emails;
export type EmailEdge = MyProfileQuery_myProfile_emails_edges;
export type EmailNode = MyProfileQuery_myProfile_emails_edges_node;

export type Phones = MyProfileQuery_myProfile_phones;
export type PhoneEdge = MyProfileQuery_myProfile_phones_edges;
export type PhoneNode = MyProfileQuery_myProfile_phones_edges_node;

export type PrimaryAddress = MyProfileQuery_myProfile_primaryAddress;
export type PrimaryEmail = MyProfileQuery_myProfile_primaryEmail;
export type PrimaryPhone = MyProfileQuery_myProfile_primaryPhone;

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

export type PermanentForeignAddress = MyProfileQuery_myProfile_verifiedPersonalInformation_permanentForeignAddress;
export type PermanentAddress = MyProfileQuery_myProfile_verifiedPersonalInformation_permanentAddress;

export type ServiceConnectionsRoot = ServiceConnectionsQuery;
export type ServiceConnectionsNode = ServiceConnectionsQuery_myProfile_serviceConnections_edges_node;
export type Service = ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service;
// eslint-disable-next-line max-len
export type ServiceAllowedFieldsNode = ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service_allowedDataFields_edges_node;
// eslint-disable-next-line max-len
export type ServiceAllowedFieldsEdge = ServiceConnectionsQuery_myProfile_serviceConnections_edges_node_service_allowedDataFields_edges;
export type GdprServiceConnectionsRoot = GdprServiceConnectionsQuery;

export { PhoneType, EmailType, AddressType, Language } from './generatedTypes';

export type AnyObject<T = unknown> = Record<string, T>;
