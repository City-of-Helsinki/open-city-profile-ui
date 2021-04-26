import {
  additionalInformationType,
  AdditionalInformationValue,
  AddressValue,
  basicDataType,
  BasicDataValue,
  createEditorForDataType,
  EditData,
  EditDataProfileSource,
  EditDataType,
  EditDataValue,
  EditFunctions,
  EmailValue,
  FormValues,
  MultiItemProfileNode,
  PhoneValue,
  pickSources,
  pickValue,
  saveTypeSetPrimary,
  updateItems,
} from '../editData';
import {
  cloneProfileAndProvideManipulationFunctions,
  getMyProfile,
} from '../../../common/test/myProfileMocking';
import {
  AddressNode,
  EmailNode,
  Language,
  Mutable,
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

  let updateCounter = 1;
  const createNewValue = (valueType: keyof FormValues): string => {
    updateCounter = updateCounter + 1;
    if (valueType === 'emails') {
      return `email_${updateCounter}@domain.com`;
    }
    if (valueType === 'phones') {
      return `555-12345-${updateCounter}`;
    }
    if (valueType === 'addresses') {
      return `address ${updateCounter}`;
    }
    if (valueType === 'language') {
      return `AF`;
    }
    return `${valueType}-${updateCounter}`;
  };

  const createUniqueEditDataValue = (
    target: EditData,
    dataType: EditDataType
  ): EditDataValue => {
    const newValue = pickValue(
      (target.value as unknown) as EditDataProfileSource,
      dataType
    ) as Mutable<EditDataValue>;
    if (dataType === 'emails') {
      (newValue as Mutable<EmailValue>).email = createNewValue(dataType);
    } else if (dataType === 'phones') {
      (newValue as Mutable<PhoneValue>).phone = createNewValue(dataType);
    } else if (dataType === 'addresses') {
      (newValue as Mutable<AddressValue>).address = createNewValue(dataType);
    } else if (dataType === basicDataType) {
      (newValue as Mutable<BasicDataValue>).firstName = createNewValue(
        'firstName'
      );
      (newValue as Mutable<BasicDataValue>).lastName = createNewValue(
        'lastName'
      );
    } else if (dataType === additionalInformationType) {
      (newValue as Mutable<
        AdditionalInformationValue
      >).language = createNewValue('language') as Language;
    }
    return newValue;
  };

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
        expect(item.primary).toEqual(undefined);
        expect(item.saving).toEqual(undefined);
        expect(item.id).toEqual(myProfileData.id);
      } else if (dataType === additionalInformationType) {
        const item = editDataList[0];
        const value = item.value as AdditionalInformationValue;
        expect(editDataList).toHaveLength(1);
        expect(value.language).toEqual(myProfileData.language);
        expect(item.primary).toEqual(undefined);
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
    it(`updateItemAndCreateSaveData clones and updates data 
    when dataType is ${dataType} and returns formValues`, () => {
      const {
        getEditData,
        updateItemAndCreateSaveData,
      } = createEditorForDataType(myProfile, dataType);
      const editDataList = getEditData();
      editDataList.forEach((target, index) => {
        const oldValue = { ...target.value };
        const newValue = createUniqueEditDataValue(target, dataType);
        const newFormValues = updateItemAndCreateSaveData(target, newValue);
        const newEditDataList = getEditData();
        const newTarget = newEditDataList[index];
        const newFormValue =
          dataType !== basicDataType && dataType !== additionalInformationType
            ? (newFormValues[dataType] as MultiItemProfileNode[])[index]
            : newFormValues;

        // new value does not match old
        expect(newValue).not.toMatchObject(oldValue);
        // old target is not mutated
        expect(target.value).toEqual(oldValue);
        // new value matches value in editData
        expect(newTarget.value).toEqual(newValue);
        // ...and in formValues
        expect(newFormValue).toMatchObject(newValue);
        // new id and primary match with old
        expect(newTarget.id).toEqual(target.id);
        expect(newTarget.primary).toEqual(target.primary);

        // verify cloning is done: editing old data does not affect new data
        (target as Mutable<EditData>).id = 'test';
        expect(newTarget.id).not.toEqual(target.id);

        // when value changes, item.saving changes to 'value'
        expect(newTarget.saving).toEqual('value');
        expect(target.saving).toEqual(undefined);

        // trying to edit an item that is being saved (item.saving !== undefined) will throw
        expect(() =>
          updateItemAndCreateSaveData(newTarget, newValue)
        ).toThrow();
      });
    });
    it(`updateData updates correct items when dataType is ${dataType}`, () => {
      const {
        getEditData,
        updateItemAndCreateSaveData,
        updateData,
      } = createEditorForDataType(myProfile, dataType);
      const editDataList = getEditData();
      editDataList.forEach((target, index) => {
        const newValue = createUniqueEditDataValue(target, dataType);
        updateItemAndCreateSaveData(target, newValue);
        const postEditDataList = getEditData();
        const postEditTarget = postEditDataList[index];
        expect(postEditTarget.saving).toEqual('value');

        const didChangeIsFalseWhenDataIsSame = updateData(myProfile);
        expect(didChangeIsFalseWhenDataIsSame).toBeFalsy();

        const profileManipulator = cloneProfileAndProvideManipulationFunctions(
          myProfile.myProfile as ProfileData
        );
        if (dataType === basicDataType) {
          profileManipulator.setBasicData(newValue as BasicDataValue);
        } else if (dataType === additionalInformationType) {
          profileManipulator.setAdditionalInformation(
            newValue as AdditionalInformationValue
          );
        } else {
          profileManipulator.edit(dataType, { ...newValue, id: target.id });
        }

        const didChange = updateData({
          myProfile: profileManipulator.getProfile(),
        });
        expect(didChange).toBeTruthy();
        const postUpdateEditData = getEditData();
        const postUpdateTarget = postUpdateEditData[index];
        expect(postEditTarget.saving).toEqual('value');
        expect(target.id).toEqual(postUpdateTarget.id);
        expect(postUpdateTarget.id).toEqual(postEditTarget.id);
        expect(postUpdateTarget.saving).toEqual(undefined);
        expect(postUpdateTarget.value).toMatchObject(newValue);
        expect(postUpdateTarget.primary).toEqual(postEditTarget.primary);
      });
    });
  });
  describe(`updateData generally`, () => {
    it(`returns new list when new profile data has no items.'`, () => {
      const emaillessProfileData: ProfileRoot = getMyProfile();
      (emaillessProfileData.myProfile as Mutable<ProfileData>).emails = null;
      const { updateData, getEditData } = createEditorForDataType(
        myProfile,
        'emails'
      );
      updateData(emaillessProfileData);
      expect(getEditData()).toHaveLength(0);
    });
  });
  describe(`updateItems `, () => {
    const dataType = 'phones';
    let editorFunctions: EditFunctions;
    let editDataList: EditData[];
    let sources: EditDataProfileSource[];
    beforeEach(() => {
      editorFunctions = createEditorForDataType(myProfile, dataType);
      editDataList = editorFunctions.getEditData();
      sources = pickSources(myProfile.myProfile as ProfileData, dataType);
    });
    it(`returns null when edit data has no items with saving set to 'value'`, () => {
      const nullList = updateItems(editDataList, sources, dataType);
      expect(nullList).toBeNull();
    });
    it(`returns null until item.value and source match and item.saving='value'`, () => {
      const item = editDataList[0] as Mutable<EditData>;
      const value = item.value as Mutable<PhoneValue>;
      const source = sources[0] as Mutable<PhoneNode>;
      item.saving = 'value';
      value.phone = createNewValue('phones');
      const nullList = updateItems(editDataList, sources, dataType);
      expect(nullList).toBeNull();
      source.phone = value.phone;
      const newList = updateItems(
        editDataList,
        sources,
        dataType
      ) as EditData[];
      expect(newList).toHaveLength(editDataList.length);
      const updatedItem = newList[0];
      // old item has not changed
      expect(item.saving).toEqual('value');
      // change saving so item will match updatedItem
      item.saving = undefined;
      expect(updatedItem).toEqual(item);
      expect(updatedItem.saving).toEqual(undefined);
    });
    it(`returns null until item.primary and source.primary match and item.saving='set-primary'`, () => {
      const item = editDataList[0] as Mutable<EditData>;
      const source = sources[0] as Mutable<PhoneNode>;
      item.saving = saveTypeSetPrimary;
      item.primary = true;
      source.primary = false;
      const nullList = updateItems(editDataList, sources, dataType);
      expect(nullList).toBeNull();
      source.primary = true;
      const newList = updateItems(
        editDataList,
        sources,
        dataType
      ) as EditData[];
      expect(newList).toHaveLength(editDataList.length);
      const updatedItem = newList[0];
      // change saving so item will match updatedItem
      expect(updatedItem).toEqual({ ...item, saving: undefined });
      expect(updatedItem.saving).toEqual(undefined);
    });
  });
  describe(`updateAfterSavingError `, () => {
    it(`resets item.saving to undefined and updates editData list with a clone`, () => {
      const { getEditData, updateAfterSavingError } = createEditorForDataType(
        myProfile,
        'phones'
      );
      const editDataList = getEditData();
      const item = editDataList[0] as Mutable<EditData>;
      const changedIsFalsy = updateAfterSavingError(item.id);
      expect(changedIsFalsy).toBeFalsy();

      item.saving = saveTypeSetPrimary;
      const changedIsTruthy = updateAfterSavingError(item.id);
      expect(changedIsTruthy).toBeTruthy();
      const updatedEditDataList = getEditData();
      const updatedItem = updatedEditDataList[0];
      expect(updatedItem).toEqual({ ...item, saving: undefined });
      expect(updatedItem.saving).toEqual(undefined);
      expect(item.saving).toEqual(saveTypeSetPrimary);
    });
  });
});
