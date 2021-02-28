import _ from 'lodash';
import { ApolloQueryResult } from '@apollo/client';

import {
  Language,
  UpdateMyProfile as UpdateMyProfileData,
  MyProfileQuery_myProfile_primaryAddress as PrimaryAddress,
  MyProfileQuery_myProfile_primaryEmail as PrimaryEmail,
  MyProfileQuery_myProfile_primaryPhone as PrimaryPhone,
  MyProfileQuery_myProfile_emails_edges_node as Email,
  MyProfileQuery_myProfile_phones_edges_node as Phone,
  MyProfileQuery_myProfile_addresses_edges_node as Address,
  MyProfileQuery,
  MyProfileQuery_myProfile,
} from '../../graphql/generatedTypes';
import { formConstants } from '../constants/formConstants';
import profileConstants from '../constants/profileConstants';
import getAddressesFromNode from './getAddressesFromNode';
import getEmailsFromNode from './getEmailsFromNode';
import getPhonesFromNode from './getPhonesFromNode';

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

type UserData = Pick<
  MyProfileQuery_myProfile,
  'firstName' | 'nickname' | 'lastName'
>;
export type AddressData = Mutable<
  Pick<Address, 'address' | 'city' | 'postalCode' | 'countryCode' | 'primary'>
>;

export type EditableUserData = Mutable<UserData>;
export type EditableAddress = Mutable<AddressData>;
export type EditableEmail = Mutable<Email>;
export type EditablePhone = Mutable<Phone>;

type AdditionalInformation = {
  id: string;
  profileLanguage: Language;
};

export type EditableAdditionalInformation = Mutable<AdditionalInformation>;

export type UpdateResult = ApolloQueryResult<UpdateMyProfileData> | null | void;

export interface BasicData extends UserData {
  id: string;
}

export const basicDataType = 'basic-data';
export const additionalInformationType = 'additional-information';

export type EditData = {
  editable?: boolean;
  removable?: boolean;
  primary?: boolean;
  profileData: Phone | Email | Address | BasicData | AdditionalInformation;
  value:
    | string
    | undefined
    | EditableAddress
    | EditableUserData
    | EditableAdditionalInformation;
  status: 'new' | 'removed' | 'edited' | undefined;
  dataType:
    | 'phones'
    | 'emails'
    | 'addresses'
    | typeof basicDataType
    | typeof additionalInformationType;
};

export type MatchResults = {
  items: EditData[];
  hasChanged: boolean;
};

export type Action =
  | 'edit'
  | 'remove'
  | 'set-primary'
  | 'cancel'
  | 'save'
  | 'add';

export type ActionListener = (
  action: Action,
  data: EditData
) => Promise<UpdateResult>;

export function getTargetData(
  myProfileQuery: MyProfileQuery,
  dataType: EditData['dataType']
): EditData['profileData'][] {
  const profile = myProfileQuery && myProfileQuery.myProfile;
  if (!profile) {
    return [];
  }
  if (dataType === 'phones') {
    const list: Phone[] = getPhonesFromNode(myProfileQuery);
    const primary = profile.primaryPhone;
    if (primary) {
      list.unshift({ ...primary });
    }
    return list;
  }
  if (dataType === 'emails') {
    const list: Email[] = getEmailsFromNode(myProfileQuery);
    const primary = profile.primaryEmail;
    if (primary) {
      list.unshift({ ...primary });
    }
    return list;
  }
  if (dataType === 'addresses') {
    const list: Address[] = getAddressesFromNode(myProfileQuery);
    const primary = profile.primaryAddress;
    if (primary) {
      list.unshift({ ...primary });
    }
    return list;
  }
  if (dataType === basicDataType) {
    const { firstName, nickname, lastName, id } = profile;
    return [
      {
        id,
        firstName,
        nickname,
        lastName,
      },
    ];
  }
  if (dataType === additionalInformationType) {
    const { language: profileLanguage } = profile;
    return [
      {
        id: '',
        profileLanguage:
          profileLanguage || (profileConstants.LANGUAGES[0] as Language),
      },
    ];
  }
  return [];
}

export function getData(
  myProfileQuery: MyProfileQuery | undefined,
  dataType: EditData['dataType']
): EditData[] {
  const profile = myProfileQuery && myProfileQuery.myProfile;
  if (!profile) {
    return [];
  }
  const targetData = getTargetData(myProfileQuery as MyProfileQuery, dataType);
  return targetData.map(targetProfileData =>
    createEditItem(dataType, targetProfileData)
  );
}

export function createEditItem(
  dataType: EditData['dataType'],
  targetProfileData: EditData['profileData']
): EditData {
  return {
    editable: true,
    removable: true,
    profileData: targetProfileData,
    value: getValue(targetProfileData, dataType),
    primary: isPrimary(targetProfileData, dataType),
    status: undefined,
    dataType,
  };
}

export type FormValues = {
  firstName: string;
  nickname: string;
  lastName: string;
  primaryEmail: PrimaryEmail;
  primaryAddress: PrimaryAddress;
  primaryPhone: PrimaryPhone;
  profileLanguage: Language;
  addresses: Address[];
  emails: Email[];
  phones: Phone[];
};

function getValue(
  profileDataItem: EditData['profileData'],
  dataType: EditData['dataType']
): EditData['value'] {
  if (dataType === 'phones') {
    return (profileDataItem as Phone).phone || '';
  }
  if (dataType === 'emails') {
    return (profileDataItem as Email).email || '';
  }
  if (dataType === 'addresses') {
    const {
      postalCode,
      address,
      city,
      countryCode,
      primary,
    } = profileDataItem as Address;
    return {
      postalCode,
      address,
      city,
      countryCode,
      primary,
    };
  }
  if (dataType === basicDataType) {
    const { firstName, nickname, lastName } = profileDataItem as BasicData;
    return {
      firstName,
      nickname,
      lastName,
    };
  }
  if (dataType === additionalInformationType) {
    const { profileLanguage } = profileDataItem as AdditionalInformation;
    return {
      id: '',
      profileLanguage,
    };
  }
  return '';
}

function isPrimary(
  profileDataItem: EditData['profileData'],
  dataType: EditData['dataType']
): boolean {
  if (dataType === 'phones') {
    return (profileDataItem as Phone).primary === true;
  }
  if (dataType === 'emails') {
    return (profileDataItem as Email).primary === true;
  }
  if (dataType === 'addresses') {
    return (profileDataItem as Address).primary === true;
  }
  return false;
}

export function updateProfileDataValue(
  item: EditData
): EditData['profileData'] {
  const profileData = item.profileData;
  const dataType = item.dataType;
  if (dataType === 'phones') {
    (profileData as EditablePhone).phone = item.value as string;
  }
  if (dataType === 'emails') {
    (profileData as EditableEmail).email = item.value as string;
  }
  if (dataType === 'addresses') {
    const target = profileData as EditableAddress;
    const source = item.value as EditableAddress;
    target.address = source.address;
    target.postalCode = source.postalCode;
    target.countryCode = source.countryCode;
    target.city = source.city;
  }
  if (dataType === basicDataType) {
    const target = profileData as EditableUserData;
    const source = item.value as EditableUserData;
    target.firstName = source.firstName;
    target.nickname = source.nickname;
    target.lastName = source.lastName;
  }
  if (dataType === additionalInformationType) {
    const target = profileData as EditableAdditionalInformation;
    const source = item.value as EditableAdditionalInformation;
    target.profileLanguage = source.profileLanguage;
  }
  return profileData;
}

function findExistingItem(
  dataItems: EditData[],
  profileDataItem: EditData['profileData']
): EditData | undefined {
  return findEditItem(dataItems, profileDataItem && profileDataItem.id);
}

function findEditItem(
  dataItems: EditData[],
  id?: string,
  status?: EditData['status']
): EditData | undefined {
  if (!id && !status) {
    return undefined;
  }
  return dataItems.find(dataItem => {
    const idMatch =
      !id || id === (dataItem.profileData && dataItem.profileData.id);
    const statusMatch = !status || status === dataItem.status;
    return idMatch && statusMatch;
  });
}

export function matchEditDataToProfileData(
  dataItems: EditData[],
  profileDataItems: EditData['profileData'][],
  dataType: EditData['dataType']
): MatchResults {
  const stats: MatchResults = {
    items: [],
    hasChanged: false,
  };
  if (dataType === basicDataType) {
    const editDataItem = dataItems[0];
    const currentUserData = editDataItem.value as EditableUserData;
    const newUserData = getValue(
      profileDataItems[0],
      dataType
    ) as EditableUserData;
    const userDataChanged = _.isEqual(currentUserData, newUserData);
    if (userDataChanged) {
      stats.hasChanged = true;
      editDataItem.value = newUserData;
    }
    stats.items.push(editDataItem);
    return stats;
  }

  if (dataType === additionalInformationType) {
    const editDataItem = dataItems[0];
    const {
      profileLanguage,
    } = editDataItem.value as EditableAdditionalInformation;
    const { profileLanguage: newLanguage } = getValue(
      profileDataItems[0],
      dataType
    ) as EditableAdditionalInformation;
    stats.hasChanged = !_.isEqual(profileLanguage, newLanguage);
    if (stats.hasChanged) {
      (editDataItem.value as EditableAdditionalInformation).profileLanguage = newLanguage;
    }
    stats.items.push(editDataItem);
    return stats;
  }
  let existingNewItem = findEditItem(dataItems, '', 'new');
  profileDataItems.forEach(profileDataItem => {
    const profileDataValue = getValue(profileDataItem, dataType);
    const existingItem = findExistingItem(dataItems, profileDataItem);
    if (existingItem) {
      existingItem.value = profileDataValue;
      existingItem.primary = (profileDataItem as
        | Phone
        | Email
        | Address).primary;
      stats.items.push(existingItem);
      stats.hasChanged = true;
    } else {
      if (
        existingNewItem &&
        _.isEqual(existingNewItem.value, profileDataValue)
      ) {
        existingNewItem.profileData = profileDataItem;
        existingNewItem.status = undefined;
        stats.items.push(existingNewItem);
        existingNewItem = undefined;
      } else {
        stats.items.push(createEditItem(dataType, profileDataItem));
      }
    }
  });
  if (dataItems.length && !profileDataItems.length) {
    stats.hasChanged = true;
  }
  if (existingNewItem) {
    stats.items.push(existingNewItem);
  }
  return stats;
}

export function collect(
  dataItems: EditData[],
  dataType: EditData['dataType']
): Partial<FormValues> {
  const data = dataItems
    .filter(dataItem => dataItem.status !== 'removed')
    .map(dataItem => dataItem.profileData);
  if (dataType === 'phones') {
    return {
      phones: data as Phone[],
    };
  }
  if (dataType === 'emails') {
    return {
      emails: data as Email[],
    };
  }
  if (dataType === 'addresses') {
    return {
      addresses: data as Address[],
    };
  }
  if (dataType === additionalInformationType) {
    const { profileLanguage } = data[0] as AdditionalInformation;
    return { profileLanguage };
  }
  const { firstName, nickname, lastName } = data[0] as BasicData;
  return { firstName, nickname, lastName };
}

export function resetBasicData(editData: EditData[]): EditableUserData {
  const basicData = editData[0];
  const data = getValue(basicData.profileData, basicDataType);
  basicData.value = data;
  return data as EditableUserData;
}

export function createNewItem(dataType: EditData['dataType']): EditData {
  const newProfileData = createNewProfileData(dataType);
  const newItem = createEditItem(dataType, newProfileData);
  newItem.status = 'new';
  return newItem;
}

export function createNewProfileData(
  dataType: EditData['dataType']
): EditData['profileData'] {
  return {
    ...(formConstants.EMPTY_VALUES[dataType] as EditData['profileData']),
  };
}

export function createEditableData(
  dataType: EditData['dataType']
): EditData['value'] {
  return getValue(
    {
      ...(formConstants.EMPTY_VALUES[dataType] as EditData['profileData']),
    },
    dataType
  );
}

export function hasNewItem(data: EditData[]): boolean {
  return !!findEditItem(data, '', 'new');
}

export function setNewPrimary(
  dataItems: EditData[],
  newPrimary: EditData
): EditData[] | null {
  const clonedDataItems = dataItems.map(dataItem => ({ ...dataItem }));
  const currentPrimary = clonedDataItems[0].primary ? clonedDataItems[0] : null;
  const newPrimaryIndex = clonedDataItems.findIndex(
    item => item.profileData.id === newPrimary.profileData.id
  );
  if (newPrimaryIndex === -1 || !newPrimary.profileData.id) {
    throw new Error('cannot set selected item as new primary');
  }
  if (
    currentPrimary &&
    currentPrimary.profileData.id === newPrimary.profileData.id
  ) {
    return null;
  }
  const clonedPrimary = clonedDataItems[newPrimaryIndex];
  if (currentPrimary) {
    currentPrimary.primary = false;
    (currentPrimary.profileData as
      | EditableEmail
      | EditablePhone
      | EditableAddress).primary = false;
  }
  clonedPrimary.primary = true;
  (clonedPrimary.profileData as
    | EditableEmail
    | EditablePhone
    | EditableAddress).primary = true;

  clonedDataItems.splice(newPrimaryIndex, 1);
  clonedDataItems.unshift(clonedPrimary);
  return clonedDataItems;
}
