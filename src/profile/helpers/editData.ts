import _ from 'lodash';

import {
  ProfileRoot,
  ProfileData,
  AddressNode,
  EmailNode,
  PhoneNode,
  PrimaryAddress,
  PrimaryEmail,
  PrimaryPhone,
  Language,
} from '../../graphql/typings';
import getAddressesFromNode from '../helpers/getAddressesFromNode';
import getEmailsFromNode from '../helpers/getEmailsFromNode';
import getPhonesFromNode from '../helpers/getPhonesFromNode';

export type BasicDataValue = Pick<
  ProfileData,
  'firstName' | 'nickname' | 'lastName'
>;
export type AdditionalInformationValue = {
  language: Language;
};
export type AddressValue = Pick<
  AddressNode,
  'address' | 'city' | 'postalCode' | 'countryCode'
>;

export type EmailValue = Pick<EmailNode, 'email'>;
export type PhoneValue = Pick<PhoneNode, 'phone'>;

type BasicDataSource = BasicDataValue & { id: ProfileData['id'] };
type AdditionalInformationSource = Pick<ProfileData, 'id' | 'language'>;
export type EditDataProfileSource =
  | BasicDataSource
  | AdditionalInformationSource
  | AddressNode
  | PhoneNode
  | EmailNode;

export type MultiItemProfileNode = AddressNode | PhoneNode | EmailNode;

export const basicDataType = 'basic-data';
export const additionalInformationType = 'additional-information';

export type EditDataType =
  | 'phones'
  | 'emails'
  | 'addresses'
  | typeof basicDataType
  | typeof additionalInformationType;

export type EditDataValue =
  | BasicDataValue
  | AdditionalInformationValue
  | AddressValue
  | PhoneValue
  | EmailValue;

export type FormValues = {
  firstName: string;
  nickname: string;
  lastName: string;
  primaryEmail: PrimaryEmail;
  primaryAddress: PrimaryAddress;
  primaryPhone: PrimaryPhone;
  language: Language;
  addresses: AddressNode[];
  emails: EmailNode[];
  phones: PhoneNode[];
};

type SaveType = 'value' | 'set-primary' | 'remove' | undefined;

export type EditData = {
  readonly id: string;
  readonly value: EditDataValue;
  readonly primary?: boolean;
  readonly saving: SaveType;
};

export type EditFunctions = {
  create: (newProfileData: EditDataProfileSource) => EditData;
  getEditData: () => EditData[];
};

function isMultiItemDataType(dataType: EditDataType): boolean {
  return !(
    dataType === basicDataType || dataType === additionalInformationType
  );
}

function getValueProps(dataType: EditDataType): string[] {
  if (dataType === 'phones') {
    return ['phone'];
  } else if (dataType === 'emails') {
    return ['email'];
  } else if (dataType === 'addresses') {
    return ['postalCode', 'address', 'city', 'countryCode'];
  } else if (dataType === basicDataType) {
    return ['firstName', 'nickname', 'lastName'];
  } else {
    return ['language'];
  }
}

function pickValue(
  profileDataItem: EditDataProfileSource,
  dataType: EditDataType
): EditDataValue {
  const pickProps = getValueProps(dataType);
  return _.pick(profileDataItem, pickProps) as EditDataValue;
}

function create(
  profileData: EditDataProfileSource,
  dataType: EditDataType,
  overrides?: { value?: EditDataValue; saving?: SaveType }
): EditData {
  return {
    id: profileData.id,
    primary: !!(profileData as MultiItemProfileNode).primary,
    value: pickValue(profileData, dataType),
    saving: undefined,
    ...overrides,
  };
}

function pickSources(
  profileData: ProfileData,
  dataType: EditDataType
): EditDataProfileSource[] {
  if (!isMultiItemDataType(dataType)) {
    const values = pickValue(profileData, dataType) as BasicDataValue &
      AdditionalInformationValue;
    return [{ ...values, id: profileData.id }];
  } else {
    const getter =
      dataType === 'phones'
        ? getPhonesFromNode
        : dataType === 'emails'
        ? getEmailsFromNode
        : getAddressesFromNode;
    const nodes: MultiItemProfileNode[] = getter(
      { myProfile: profileData },
      true
    );
    return nodes.map(node => ({ ...node }));
  }
}

export function createEditorForDataType(
  profileRoot: ProfileRoot,
  dataType: EditDataType
): EditFunctions {
  const profileData = profileRoot.myProfile as ProfileData;
  const profileDataSources = pickSources(profileData, dataType);
  const allItems: EditData[] = profileDataSources.map(source =>
    create(source, dataType)
  );
  return {
    create: newProfileData => create(newProfileData, dataType),
    getEditData: () => allItems,
  };
}
