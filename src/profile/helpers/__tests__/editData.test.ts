import {
  additionalInformationType,
  AdditionalInformationValue,
  AddressValue,
  basicDataType,
  BasicDataValue,
  createEditorForDataType,
  EditDataType,
  EmailValue,
  PhoneValue,
} from '../editData';
import { getMyProfile } from '../../../common/test/myProfileMocking';
import {
  AddressNode,
  EmailNode,
  PhoneNode,
  ProfileData,
  ProfileRoot,
} from '../../../graphql/typings';
import getAddressesFromNode from '../getAddressesFromNode';
import getEmailsFromNode from '../getEmailsFromNode';
import getPhonesFromNode from '../getPhonesFromNode';

describe('editData.ts ', () => {
  const singleDataTypes: EditDataType[] = [
    basicDataType,
    additionalInformationType,
  ];
  const multiItemDataTypes: EditDataType[] = ['addresses', 'emails', 'phones'];
  const allDataTypes: EditDataType[] = [
    ...singleDataTypes,
    ...multiItemDataTypes,
  ];
  let myProfile: ProfileRoot;
  beforeEach(() => {
    myProfile = getMyProfile();
  });
  allDataTypes.forEach(dataType => {
    it(`Picks correct data from myProfile when dataType is ${dataType}`, () => {
      const { getEditData } = createEditorForDataType(myProfile, dataType);
      const editDataList = getEditData();
      const myProfileData = myProfile.myProfile as ProfileData;
      if (dataType === basicDataType) {
        const item = editDataList[0];
        const value = item.value as BasicDataValue;
        expect(editDataList).toHaveLength(1);
        expect(value.firstName).toEqual(myProfileData.firstName);
        expect(value.nickname).toEqual(myProfileData.nickname);
        expect(value.lastName).toEqual(myProfileData.lastName);
        expect(item.primary).toEqual(false);
        expect(item.saving).toEqual(undefined);
        expect(item.id).toEqual(myProfileData.id);
      } else if (dataType === additionalInformationType) {
        const item = editDataList[0];
        const value = item.value as AdditionalInformationValue;
        expect(editDataList).toHaveLength(1);
        expect(value.language).toEqual(myProfileData.language);
        expect(item.primary).toEqual(false);
        expect(item.saving).toEqual(undefined);
        expect(item.id).toEqual(myProfileData.id);
      } else if (dataType === 'addresses') {
        const addressNodes = getAddressesFromNode(myProfile);
        addressNodes.unshift(myProfileData.primaryAddress as AddressNode);
        expect(editDataList).toHaveLength(2);
        expect(editDataList).toHaveLength(addressNodes.length);
        editDataList.forEach((item, index) => {
          const node = addressNodes[index];
          const value = item.value as AddressValue;
          expect(value.address).toEqual(node.address);
          expect(value.postalCode).toEqual(node.postalCode);
          expect(value.city).toEqual(node.city);
          expect(value.countryCode).toEqual(node.countryCode);
          expect(item.saving).toEqual(undefined);
          expect(item.primary).toEqual(!!node.primary);
          expect(item.id).toEqual(node.id);
        });
      } else if (dataType === 'emails') {
        const emailNodes = getEmailsFromNode(myProfile);
        emailNodes.unshift(myProfileData.primaryEmail as EmailNode);
        expect(editDataList).toHaveLength(2);
        expect(editDataList).toHaveLength(emailNodes.length);
        editDataList.forEach((item, index) => {
          const node = emailNodes[index];
          const value = item.value as EmailValue;
          expect(value.email).toEqual(node.email);
          expect(item.saving).toEqual(undefined);
          expect(item.primary).toEqual(!!node.primary);
          expect(item.id).toEqual(node.id);
        });
      } else if (dataType === 'phones') {
        const phoneNodes = getPhonesFromNode(myProfile);
        phoneNodes.unshift(myProfileData.primaryPhone as PhoneNode);
        expect(editDataList).toHaveLength(2);
        expect(editDataList).toHaveLength(phoneNodes.length);
        editDataList.forEach((item, index) => {
          const node = phoneNodes[index];
          const value = item.value as PhoneValue;
          expect(value.phone).toEqual(node.phone);
          expect(item.saving).toEqual(undefined);
          expect(item.primary).toEqual(!!node.primary);
          expect(item.id).toEqual(node.id);
        });
      }
    });
  });
});
