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
  getNewItem,
  hasNewItem,
  isMultiItemDataType,
  isNewItem,
  MultiItemProfileNode,
  PhoneValue,
  pickSources,
  pickValue,
  saveTypeSetPrimary,
  updateItems,
  setPrimary,
  movePrimaryAsFirst,
  getEmailEditDataForUI,
  getAddressEditDataForUI,
} from '../editData';
import {
  cloneProfileAndProvideManipulationFunctions,
  getMyProfile,
  getMyProfileQueryWithoutSomeNodes,
  getNodesByDataType,
  getPrimaryNode,
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
    'emails',
    'addresses',
  ];
  const multiItemDataTypes: EditDataType[] = ['phones'];
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

  const pickItemIds = (itemList: (EditData | MultiItemProfileNode)[]) =>
    itemList.map(item => item.id);

  const createTestDataWithNewItem = (dataType: EditDataType) => {
    const editor = createEditorForDataType(myProfile, dataType);
    const oldList = editor.getEditData();
    const newItem = editor.addItem();
    const newList = editor.getEditData();
    //list of ids is stored for checking wrong items are not removed.
    const oldIdList = pickItemIds(oldList);
    return {
      editor,
      oldList,
      newList,
      newItem,
      oldIdList,
    };
  };
  const pickMultiItemFormValues = (
    formValues: FormValues | Partial<FormValues>,
    dataType: EditDataType
  ): MultiItemProfileNode[] =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    formValues[dataType] as MultiItemProfileNode[];

  const getProfileWithOneNode = (
    dataType: Extract<EditDataType, 'addresses' | 'phones' | 'emails'>
  ): ProfileRoot => {
    const profileManipulator = cloneProfileAndProvideManipulationFunctions(
      myProfile.myProfile as ProfileData
    );
    // remove all nodes after index 0
    getNodesByDataType(dataType, myProfile)
      .slice(1)
      .forEach(node => {
        profileManipulator.remove(dataType, node);
      });
    const modifiedMyProfile = profileManipulator.getProfile();
    expect(
      getNodesByDataType(dataType, { myProfile: modifiedMyProfile })
    ).toHaveLength(1);
    return { myProfile: modifiedMyProfile };
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
          expect(item.primary).toEqual(node.primary);
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
      const isMultiItem = isMultiItemDataType(dataType);
      editDataList.forEach((target, index) => {
        const oldValue = { ...target.value };
        const newValue = createUniqueEditDataValue(target, dataType);
        const newFormValues = updateItemAndCreateSaveData(target, newValue);
        const newEditDataList = getEditData();
        const newTarget = newEditDataList[index];
        const newFormValue = isMultiItem
          ? pickMultiItemFormValues(newFormValues, dataType)[index]
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
        // nodes should have id
        if (isMultiItem) {
          expect((newFormValue as MultiItemProfileNode).id).toEqual(target.id);
        }

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
  multiItemDataTypes.forEach(dataType => {
    describe(`addItem `, () => {
      it(`creates new ${dataType} item with correct properties`, () => {
        const { newItem } = createTestDataWithNewItem(dataType);
        expect(newItem.id).toEqual('');
        expect(newItem.primary).toBeFalsy();
        expect(newItem.saving).toBeUndefined();
        if (dataType === 'phones') {
          expect((newItem.value as PhoneValue).phone).toBeDefined();
        } else if (dataType === 'addresses') {
          expect((newItem.value as AddressValue).address).toBeDefined();
        }
      });
      it(`updateItemAndCreateSaveData updates the new ${dataType} item and it returns formValues`, () => {
        const { editor, newItem } = createTestDataWithNewItem(dataType);
        const newValue = createUniqueEditDataValue(newItem, dataType);
        const saveData = editor.updateItemAndCreateSaveData(newItem, newValue);
        const updatedList = editor.getEditData();
        const updatedNewItem = updatedList[updatedList.length - 1];
        const itemsInFormValues = pickMultiItemFormValues(saveData, dataType);
        const newNodeInFormValues =
          itemsInFormValues[itemsInFormValues.length - 1];
        expect(newNodeInFormValues.id).toEqual(newItem.id);
        expect(updatedNewItem.value).toMatchObject(newValue);
        expect(pickValue(newNodeInFormValues, dataType)).toMatchObject(
          newValue
        );
      });
      it(`creates new ${dataType} item and helper functions detect it correctly`, () => {
        const {
          newList,
          newItem,
          oldList,
          oldIdList,
        } = createTestDataWithNewItem(dataType);
        expect(newList.length).toEqual(oldList.length + 1);
        expect(pickItemIds(newList)).toEqual([...oldIdList, '']);

        expect(isNewItem(newItem)).toEqual(true);
        expect(isNewItem(newList[0])).toEqual(false);

        expect(hasNewItem(newList)).toEqual(true);
        expect(hasNewItem(oldList)).toEqual(false);

        expect(getNewItem(oldList)).toBeUndefined();
        expect(getNewItem(newList)).toMatchObject(newItem);
        // new item is last one in the array
        expect(newList[newList.length - 1]).toMatchObject(newItem);
      });
      it(`adding a second new item throws`, () => {
        const { editor } = createTestDataWithNewItem(dataType);
        expect(() => editor.addItem()).toThrow();
      });
      it(`updateData updates profile data with new item when dataType is ${dataType}. 
      New item does not exist after update`, () => {
        const { editor, newItem, oldIdList } = createTestDataWithNewItem(
          dataType
        );
        const newValue = createUniqueEditDataValue(newItem, dataType);
        editor.updateItemAndCreateSaveData(newItem, newValue);
        const profileManipulator = cloneProfileAndProvideManipulationFunctions(
          myProfile.myProfile as ProfileData
        );
        const newItemId = '999';
        profileManipulator.add(dataType, { ...newValue, id: newItemId });
        editor.updateData({
          myProfile: profileManipulator.getProfile(),
        });
        const updatedItems = editor.getEditData();
        expect(hasNewItem(updatedItems)).toBeFalsy();
        expect(updatedItems[updatedItems.length - 1].value).toMatchObject(
          newValue
        );
        expect(updatedItems[updatedItems.length - 1].id).toEqual(newItemId);
        expect(pickItemIds(updatedItems)).toEqual([...oldIdList, newItemId]);
      });
    });
    describe(`removeItem `, () => {
      it(`removing old ${dataType} item does not remove it until data is updated. 
      Old item removal returns formValues without the removed item. `, () => {
        const { editor, newList } = createTestDataWithNewItem(dataType);
        // index of item to remove
        const testIndex = 0;
        // item to remove
        const removeItem = newList[testIndex];
        // removeItem() returns new formValues
        const saveData = editor.removeItem(removeItem) as FormValues;
        // old item is not removed, just marked by setting item.saving = 'remove'
        const editDataWithRemovedItem = editor.getEditData();
        const updatedItem = editDataWithRemovedItem[testIndex];
        expect(saveData).toBeDefined();
        expect(updatedItem.saving).toEqual('remove');
        // original item is not mutated
        expect(removeItem.saving).toBeUndefined();
        const itemsInFormValues = pickMultiItemFormValues(saveData, dataType);
        // item at target index has chaged
        expect(itemsInFormValues[testIndex].id).toEqual(
          editDataWithRemovedItem[testIndex + 1].id
        );
        // edit data have not changed yet
        expect(editDataWithRemovedItem.length).toEqual(newList.length);
        expect(pickItemIds(editDataWithRemovedItem)).toEqual(
          pickItemIds(newList)
        );
        // formValues do not have removed item
        expect(editDataWithRemovedItem.length).toEqual(
          itemsInFormValues.length + 1
        );
        const newIdListWithoutRemovedItem = pickItemIds(newList);
        newIdListWithoutRemovedItem.shift();
        // removed id not found in ids
        expect(pickItemIds(itemsInFormValues)).toEqual(
          newIdListWithoutRemovedItem
        );

        // update data and verify item @testIndex has different item
        const nextFirstItem = editDataWithRemovedItem[testIndex + 1];

        const profileManipulator = cloneProfileAndProvideManipulationFunctions(
          myProfile.myProfile as ProfileData
        );
        profileManipulator.remove(dataType, removeItem);

        editor.updateData({
          myProfile: profileManipulator.getProfile(),
        });
        const updatedItems = editor.getEditData();
        expect(updatedItems.length).toEqual(newList.length - 1);
        expect(updatedItems[testIndex]).toMatchObject(nextFirstItem);
        const updatedIdList = pickItemIds(updatedItems);
        expect(updatedIdList).toEqual(newIdListWithoutRemovedItem);
        expect(updatedIdList.indexOf(removeItem.id)).toEqual(-1);
        // new item is still found as last item
        expect(isNewItem(updatedItems[updatedItems.length - 1])).toBeTruthy();
      });

      it(`removes new ${dataType} item. 
      New item removal does not return new formValues but 'null'. 
      Item list is immediately updated.`, () => {
        const {
          newItem,
          editor,
          newList,
          oldIdList,
        } = createTestDataWithNewItem(dataType);
        const formValues = editor.removeItem(newItem);
        const listWithoutNew = editor.getEditData();
        expect(hasNewItem(listWithoutNew)).toBeFalsy();
        expect(formValues).toBeNull();
        expect(editor.getEditData().length).toEqual(newList.length - 1);
        expect(pickItemIds(listWithoutNew)).toEqual(oldIdList);
      });
      it(`removing missing items throw`, () => {
        const { editor } = createTestDataWithNewItem(dataType);
        expect(() =>
          editor.removeItem({ id: 'this_wont_exist' } as EditData)
        ).toThrow();
      });
      it(`removing an item twice throws`, () => {
        const { editor } = createTestDataWithNewItem(dataType);
        const item = editor.getEditData()[0];
        editor.removeItem(item);
        expect(() => {
          editor.removeItem(item);
        }).toThrow();
      });
    });
    describe(`updateItems `, () => {
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
        const newValue = createUniqueEditDataValue(item, dataType);
        const source = sources[0] as Mutable<MultiItemProfileNode>;
        item.saving = 'value';
        item.value = newValue;
        const nullList = updateItems(editDataList, sources, dataType);
        expect(nullList).toBeNull();
        const updatedSource = { ...source, ...newValue };
        sources[0] = updatedSource;
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
    describe(`setPrimary `, () => {
      let editorFunctions: EditFunctions;
      let editDataList: EditData[];
      beforeEach(() => {
        editorFunctions = createEditorForDataType(myProfile, dataType);
        editDataList = editorFunctions.getEditData();
      });
      it(`returns null when item is already the primary item. Null indicates there is no need to save`, () => {
        const nullList = setPrimary(editDataList, editDataList[0]);
        expect(nullList).toBeNull();
      });
      it(`returns new, cloned data when primary changes. Previous and new primary have correct props.`, () => {
        const [oldPrimary, newPrimary] = editDataList;
        const newEditDataList = setPrimary(
          editDataList,
          newPrimary
        ) as EditData[];

        const [clonedOldPrimary, clonedNewPrimary] = newEditDataList;
        expect(oldPrimary.id).toEqual(clonedOldPrimary.id);
        expect(newPrimary.id).toEqual(clonedNewPrimary.id);

        // data has been cloned, so old values are unchanged
        expect(oldPrimary.saving).toBeUndefined();
        expect(newPrimary.saving).toBeUndefined();
        expect(oldPrimary.primary).toBeTruthy();
        expect(newPrimary.primary).toBeFalsy();

        // 'saving' and 'primary' are set in new data
        expect(clonedOldPrimary.saving).toEqual(saveTypeSetPrimary);
        expect(clonedNewPrimary.saving).toEqual(saveTypeSetPrimary);
        expect(clonedOldPrimary.primary).toBeFalsy();
        expect(clonedNewPrimary.primary).toBeTruthy();
      });
      it(`returns new, cloned data when primary was not set yet.`, () => {
        const [currentPrimary, newPrimary] = editDataList;
        // there is no function to clear current primary item
        // so clearing it by force
        (currentPrimary as Mutable<EditData>).primary = false;
        const newEditDataList = setPrimary(
          editDataList,
          newPrimary
        ) as EditData[];
        const [clonedOldPrimary, clonedNewPrimary] = newEditDataList;
        expect(currentPrimary.id).toEqual(clonedOldPrimary.id);
        expect(newPrimary.id).toEqual(clonedNewPrimary.id);

        // 'saving' and 'primary' are set in new data
        expect(clonedOldPrimary.saving).toBeUndefined();
        expect(clonedNewPrimary.saving).toEqual(saveTypeSetPrimary);
      });
      it(`throws an error when item is not found or setting a saving item as primary`, () => {
        expect(() =>
          setPrimary(editDataList, { id: 'notfound' } as EditData)
        ).toThrow();
        const [oldPrimary, newPrimary] = editDataList;
        editorFunctions.setPrimary(newPrimary);
        expect(() => editorFunctions.setPrimary(newPrimary)).toThrow();
        expect(() => editorFunctions.setPrimary(oldPrimary)).toThrow();
      });
    });
    describe(`movePrimaryAsFirst `, () => {
      const primaryItem = { primary: true, id: '1' } as EditData;
      const nonPrimaryItem1 = { primary: false, id: '2' } as EditData;
      const nonPrimaryItem2 = { primary: false, id: '3' } as EditData;

      const moveAndVerify = (
        nonArrangedList: EditData[],
        assumedResult: EditData[]
      ): EditData[] => {
        const currentPrimary = nonArrangedList.filter(item => item.primary)[0];
        const newOrder = movePrimaryAsFirst(nonArrangedList);
        expect(newOrder).toEqual(assumedResult);
        if (currentPrimary) {
          const newPrimary = newOrder[0];
          expect(newPrimary.id).toEqual(currentPrimary.id);
          expect(newPrimary.primary).toBeTruthy();
        }
        return newOrder;
      };

      it(`returns re-arranged array where primary item is at index 0 and other items are in old order`, () => {
        moveAndVerify(
          [nonPrimaryItem1, nonPrimaryItem2, primaryItem],
          [primaryItem, nonPrimaryItem1, nonPrimaryItem2]
        );
        moveAndVerify(
          [primaryItem, nonPrimaryItem1, nonPrimaryItem2],
          [primaryItem, nonPrimaryItem1, nonPrimaryItem2]
        );
        moveAndVerify(
          [nonPrimaryItem1, nonPrimaryItem2, nonPrimaryItem1, nonPrimaryItem2],
          [nonPrimaryItem1, nonPrimaryItem2, nonPrimaryItem1, nonPrimaryItem2]
        );
        moveAndVerify([], []);
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

  describe(`updateAfterSavingError `, () => {
    it(`resets item.saving to undefined and updates editData list with a clone`, () => {
      const newValue: EditDataValue = { phone: '555-5555' };
      const {
        getEditData,
        updateAfterSavingError,
        updateItemAndCreateSaveData,
      } = createEditorForDataType(myProfile, 'phones');
      const editDataList = getEditData();
      const item = editDataList[0] as Mutable<EditData>;
      const changedIsFalsy = updateAfterSavingError(item.id);
      expect(changedIsFalsy).toBeFalsy();

      updateItemAndCreateSaveData(item, newValue);
      const changedIsTruthy = updateAfterSavingError(item.id);
      expect(changedIsTruthy).toBeTruthy();
      const updatedEditDataList = getEditData();
      const updatedItem = updatedEditDataList[0];
      expect(updatedItem).toEqual({
        ...item,
        value: newValue,
        saving: undefined,
      });
      expect(updatedItem.saving).toEqual(undefined);
    });
    it(`handles both items when rolling back primary change`, () => {
      const {
        getEditData,
        updateAfterSavingError,
        // imported setPrimary -function not used to keep data in scope with updateAfterSavingError and getEditData
        setPrimary: setPrimaryScopedToEditData,
      } = createEditorForDataType(myProfile, 'phones');
      const editDataList = getEditData();
      const [initialPrimary, nextPrimary] = editDataList;
      // items are not being saved yet, so function returns false indication nothing to update
      const currentPrimaryIsNotRolledBack = updateAfterSavingError(
        initialPrimary.id
      );
      const nextPrimaryIsNotRolledBack = updateAfterSavingError(nextPrimary.id);
      expect(currentPrimaryIsNotRolledBack).toBeFalsy();
      expect(nextPrimaryIsNotRolledBack).toBeFalsy();

      setPrimaryScopedToEditData(nextPrimary) as EditData[];
      const editDataAfterPrimaryChange = getEditData();
      const [newPrimary, oldPrimary] = editDataAfterPrimaryChange;
      expect(oldPrimary.id).toEqual(initialPrimary.id);
      expect(newPrimary.id).toEqual(nextPrimary.id);
      // rollback
      const changedIsTruthy = updateAfterSavingError(newPrimary.id);
      expect(changedIsTruthy).toBeTruthy();

      const rolledBackEditDataList = getEditData();
      const [rolledBackPrimary, rolledBackNextPrimary] = rolledBackEditDataList;
      expect(rolledBackPrimary).toEqual({
        ...oldPrimary,
        primary: true,
        saving: undefined,
      });
      expect(rolledBackNextPrimary).toEqual({
        ...newPrimary,
        primary: false,
        saving: undefined,
      });
    });
  });

  describe(`getEmailEditDataForUI() `, () => {
    const dataType: EditDataType = 'emails';
    const validEmail = 'valid@domain.com';
    it(`returns the primary email picked from email items. The primaryEmail prop is not used.`, () => {
      const profileQueryWithoutPrimaryEmailProperty = getMyProfileQueryWithoutSomeNodes(
        {
          clearPrimary: true,
          dataType,
        }
      );
      const { getEditData } = createEditorForDataType(
        profileQueryWithoutPrimaryEmailProperty,
        dataType
      );
      const item = getEmailEditDataForUI(getEditData());
      const primaryEmailNode = getPrimaryNode(
        dataType,
        profileQueryWithoutPrimaryEmailProperty
      ) as EmailNode;
      expect(item.id).toEqual(primaryEmailNode.id);
      expect(item.primary).toBeTruthy();
    });
    it(`If emails exist, but none have primary = true, an empty editData item is returned`, () => {
      const profileQueryWithoutPrimaryEmail = getMyProfileQueryWithoutSomeNodes(
        {
          noPrimary: true,
          dataType,
        }
      );

      expect(
        getPrimaryNode(dataType, profileQueryWithoutPrimaryEmail)
      ).toBeUndefined();

      const { getEditData } = createEditorForDataType(
        profileQueryWithoutPrimaryEmail,
        dataType
      );
      const emptyItem = getEmailEditDataForUI(getEditData());
      expect(emptyItem.id).toEqual('');
      expect((emptyItem.value as EmailValue).email).toEqual('');
    });
    it(`All emails are included in the save data. Also those not visible in UI. Item's email is updated.`, () => {
      const {
        getEditData,
        updateItemAndCreateSaveData,
      } = createEditorForDataType(myProfile, dataType);
      expect(getEditData()).toHaveLength(2);
      const item = getEmailEditDataForUI(getEditData());
      const index = getEditData().findIndex(
        arrayItem => arrayItem.id === item.id
      );
      const saveData = updateItemAndCreateSaveData(item, {
        email: validEmail,
      });
      const emailData = saveData.emails as EmailNode[];
      expect(emailData).toHaveLength(2);
      expect(emailData[index].id).toEqual(item.id);
      expect(emailData[index].email).toEqual(validEmail);
    });
    it(`When a new email is added, it has 'primary' set to 'true' and all emails are included in the save data`, () => {
      const profileQueryWithoutPrimaryEmails = getMyProfileQueryWithoutSomeNodes(
        { noPrimary: true, dataType }
      );
      const {
        getEditData,
        addItem,
        updateItemAndCreateSaveData,
      } = createEditorForDataType(profileQueryWithoutPrimaryEmails, dataType);
      expect(getEditData()).toHaveLength(2);
      addItem();
      expect(getEditData()).toHaveLength(3);
      const item = getEmailEditDataForUI(getEditData());
      expect(item.primary).toBeTruthy();
      expect((item.value as EmailValue).email).toEqual('');

      const saveData = updateItemAndCreateSaveData(item, {
        email: validEmail,
      });
      // new item is always the last
      const newEmailInSaveData = (saveData.emails as EmailNode[]).pop() as EmailNode;
      expect(newEmailInSaveData.primary).toBeTruthy();
      expect(newEmailInSaveData.email).toEqual(validEmail);
    });
  });
  describe(`Adding a new email`, () => {
    it(`An error is thrown when adding a new email, but primary node already exists`, () => {
      const profileDataWithOneEmailNode = getProfileWithOneNode('emails');
      const { addItem } = createEditorForDataType(
        profileDataWithOneEmailNode,
        'emails'
      );
      expect(() => addItem()).toThrow();
    });
  });
  describe(`getAddressEditDataForUI() `, () => {
    const dataType: EditDataType = 'addresses';
    it(`returns the primary address picked from list of address nodes. 
        The primaryAddress prop in profileData is not used, only node list.`, () => {
      const profileQueryWithoutPrimaryAddressProperty = getMyProfileQueryWithoutSomeNodes(
        {
          clearPrimary: true,
          dataType,
        }
      );
      const { getEditData } = createEditorForDataType(
        profileQueryWithoutPrimaryAddressProperty,
        dataType
      );
      const item = getAddressEditDataForUI(getEditData());
      const primaryNode = getPrimaryNode(
        dataType,
        profileQueryWithoutPrimaryAddressProperty
      ) as AddressNode;
      expect(item.id).toEqual(primaryNode.id);
      expect(item.primary).toBeTruthy();
    });
    it(`If none of the nodes have primary = true, the first node is returned. 
        This way user can remove all addresses.`, () => {
      const profileQueryWithoutPrimaryAddress = getMyProfileQueryWithoutSomeNodes(
        {
          noPrimary: true,
          dataType,
        }
      );

      const { getEditData } = createEditorForDataType(
        profileQueryWithoutPrimaryAddress,
        dataType
      );

      const addressesInProfile = getAddressesFromNode(
        profileQueryWithoutPrimaryAddress,
        true
      )[0];

      const addressInEditData = getAddressEditDataForUI(getEditData());
      expect(addressInEditData.id).toEqual(addressesInProfile.id);
      expect((addressInEditData.value as AddressValue).address).toEqual(
        addressesInProfile.address
      );
    });
    it(`If addresses do not exist, an empty editData item is returned`, () => {
      const profileQueryWithoutAddresses = getMyProfileQueryWithoutSomeNodes({
        noNodes: true,
        dataType,
      });

      const { getEditData } = createEditorForDataType(
        profileQueryWithoutAddresses,
        dataType
      );
      const emptyItem = getAddressEditDataForUI(getEditData());
      expect(emptyItem.id).toEqual('');
      expect((emptyItem.value as AddressValue).address).toEqual('');
    });
    it(`All addresses are included in the save data. Also those not visible in UI. Item's data is updated.`, () => {
      const {
        getEditData,
        updateItemAndCreateSaveData,
      } = createEditorForDataType(myProfile, dataType);
      expect(getEditData()).toHaveLength(2);
      const validAddress: AddressValue = {
        address: 'valid-address',
        city: 'valid-city',
        postalCode: '123',
        countryCode: 'FI',
      };
      const item = getAddressEditDataForUI(getEditData());
      const index = getEditData().findIndex(
        arrayItem => arrayItem.id === item.id
      );
      const saveData = updateItemAndCreateSaveData(item, validAddress);
      const addressData = saveData.addresses as AddressNode[];
      const addressInSaveData = pickValue(addressData[index], dataType);
      expect(addressData).toHaveLength(2);
      expect(addressData[index].id).toEqual(item.id);
      expect(addressInSaveData).toEqual(validAddress);
    });
  });
  describe(`Adding a new address`, () => {
    it(`An error is thrown when adding a second address`, () => {
      const profileDataWithOneAddressNode = getProfileWithOneNode('addresses');
      const { addItem } = createEditorForDataType(
        profileDataWithOneAddressNode,
        'addresses'
      );
      expect(() => addItem()).toThrow();
    });
  });
});
