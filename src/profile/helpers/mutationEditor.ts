import _ from 'lodash';
import { ExecutionResult } from '@apollo/react-common';

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

type EditableUserData = Mutable<UserData>;

type AdditionalInformation = {
  id: string;
  profileLanguage: Language;
};

export type EditableAdditionalInformation = Mutable<AdditionalInformation>;

export type UpdateResult = ExecutionResult<UpdateMyProfileData> | null | void;

export interface BasicData extends UserData {
  id: string;
  addresses: Address[];
}

export type EditableAddress = Mutable<
  Pick<Address, 'address' | 'city' | 'postalCode' | 'countryCode'>
>;

export type EditableEmail = Mutable<Email>;
export type EditablePhone = Mutable<Phone>;

export interface EditableBasicData extends EditableUserData {
  addresses: EditableAddress[];
}

export const basicDataType = 'basic-data-with-addresses';
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
    | EditableBasicData
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
  | 'prioritize'
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
    const addresses: Address[] = getAddressesFromNode(myProfileQuery);
    const primary = profile.primaryAddress;
    if (primary) {
      addresses.unshift({ ...primary });
    }
    const { firstName, nickname, lastName, id } = profile;
    return [
      {
        id,
        firstName,
        nickname,
        lastName,
        addresses,
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
    } = profileDataItem as Address;
    return {
      postalCode,
      address,
      city,
      countryCode,
    };
  }
  if (dataType === basicDataType) {
    const {
      firstName,
      nickname,
      lastName,
      addresses,
    } = profileDataItem as BasicData;
    return {
      firstName,
      nickname,
      lastName,
      addresses: addresses.map(address => ({
        postalCode: address.postalCode,
        address: address.address,
        city: address.city,
        countryCode: address.countryCode,
      })),
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
    const target = profileData as EditableBasicData;
    const source = item.value as EditableBasicData;
    target.firstName = source.firstName;
    target.nickname = source.nickname;
    target.lastName = source.lastName;

    if (source.addresses.length < target.addresses.length) {
      target.addresses.length = source.addresses.length;
    }

    target.addresses.forEach((address, index) => {
      address.address = source.addresses[index].address;
      address.postalCode = source.addresses[index].postalCode;
      address.city = source.addresses[index].city;
      address.countryCode = source.addresses[index].countryCode;
    });

    if (source.addresses.length > target.addresses.length) {
      const newAddressValues = source.addresses[source.addresses.length - 1];
      const newAddress = {
        ...(formConstants.EMPTY_VALUES['addresses'] as EditableAddress),
      };
      newAddress.address = newAddressValues.address;
      newAddress.postalCode = newAddressValues.postalCode;
      newAddress.city = newAddressValues.city;
      newAddress.countryCode = newAddressValues.countryCode;
      target.addresses.push(newAddress);
    }
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
    const {
      addresses,
      ...currentUserData
    } = editDataItem.value as EditableBasicData;
    const { addresses: newAddresses, ...newUserData } = getValue(
      profileDataItems[0],
      dataType
    ) as EditableBasicData;
    const userDataChanged = _.isEqual(currentUserData, newUserData);
    const arrayDataChanged = _.isEqual(addresses, newAddresses);
    if (userDataChanged || arrayDataChanged) {
      stats.hasChanged = true;
    }
    stats.items.push(editDataItem);
    return stats;
  }

  if (dataType === additionalInformationType) {
    const editDataItem = dataItems[0];
    const {
      profileLanguage,
    } = editDataItem.value as EditableAdditionalInformation;
    const { addresses: newLanguage } = getValue(
      profileDataItems[0],
      dataType
    ) as EditableBasicData;
    stats.hasChanged = !_.isEqual(profileLanguage, newLanguage);
    stats.items.push(editDataItem);
    return stats;
  }
  let existingNewItem = findEditItem(dataItems, '', 'new');
  profileDataItems.forEach(profileDataItem => {
    const profileDataValue = getValue(profileDataItem, dataType);
    const existingItem = findExistingItem(dataItems, profileDataItem);
    if (existingItem) {
      existingItem.value = profileDataValue;
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
  if (existingNewItem) {
    stats.items.push(existingNewItem);
  }
  return stats;
}

export function convertUpdateMyProfileDataToMyProfile(
  updateMyProfileData: UpdateMyProfileData | undefined
): MyProfileQuery | null {
  const updatedProfile = updateMyProfileData?.updateMyProfile?.profile;
  if (!updatedProfile) {
    return null;
  }
  return {
    myProfile: (updatedProfile as unknown) as MyProfileQuery_myProfile,
  };
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
  const { firstName, nickname, lastName, addresses } = data[0] as BasicData;
  return { firstName, nickname, lastName, addresses };
}

export function addNewAddressToBasicData(item: EditData): EditData {
  const newAddressData = createNewProfileData('addresses') as Address;
  (item.profileData as BasicData).addresses.push(newAddressData);

  item.value = getValue(item.profileData, item.dataType);
  return item;
}

export function resetBasicData(editData: EditData[]): EditableBasicData {
  const basicData = editData[0];
  const data = getValue(basicData.profileData, basicDataType);
  basicData.value = data;
  return data as EditableBasicData;
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
