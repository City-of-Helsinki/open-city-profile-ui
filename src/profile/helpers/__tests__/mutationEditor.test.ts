import _ from 'lodash';

import {
  Language,
  ProfileRoot,
  ProfileData,
  AddressNode,
  EmailNode,
  PhoneNode,
  InsertableEdge,
} from '../../../graphql/typings';
import {
  getMyProfile,
  removeAddress,
  collectAllNodes,
  edgesObjectToNodeList,
  removePhone,
  removeEmail,
  findAndUpdateEdgesNode,
  getAddFunc,
  getCreatorFunc,
  setAsPrimary,
} from '../../../common/test/myProfileMocking';
import {
  basicDataType,
  createEditData,
  EditableAddress,
  pickProfileData,
  updateProfileDataFromEditData,
  createEditDataValueFromProfileData,
  findEditItemIndex,
  createNewEditItem,
  collectProfileData,
  isNew,
  hasNewItem,
  resetEditDataValue,
  cloneData,
  setNewPrimary,
  EditData,
  mergeOldEditDataToNewProfileData,
  cloneDataAndGetCurrentClone,
  createNewProfileData,
  additionalInformationType,
  EditableAdditionalInformation,
  EditableUserData,
} from '../mutationEditor';

type PrimaryItem = AddressNode | EmailNode | PhoneNode;
type TestData = {
  profile: ProfileRoot;
  myProfileData: ProfileData;
  nodes: PrimaryItem[];
  editItems: EditData[];
  clonedItems: EditData[];
  collectedProfileData: EditData['profileData'][];
};

describe('mutationEditor.ts ', () => {
  const listDataTypes: EditData['dataType'][] = [
    'addresses',
    'emails',
    'phones',
  ];
  const allDataTypes: EditData['dataType'][] = [
    ...listDataTypes,
    basicDataType,
    additionalInformationType,
  ];
  let testData: TestData;
  let isListDataType: boolean;
  const createTestData = (dataType: EditData['dataType']): TestData => {
    const profile = getMyProfile();
    const myProfileData = profile.myProfile as ProfileData;
    const nodes = getNodeList(myProfileData, dataType);
    const editItems = createEditData(profile, dataType);
    const clonedItems = cloneData(editItems);
    const collectedProfileData = collectProfileDataFromEditData(
      editItems,
      dataType
    );
    return {
      profile,
      myProfileData,
      nodes,
      editItems,
      clonedItems,
      collectedProfileData,
    };
  };

  const getChangeValue = (dataType: EditData['dataType']): string => {
    if (dataType === 'addresses') {
      return `changed-address`;
    }
    if (dataType === 'phones') {
      return `55555123`;
    }
    if (dataType === 'emails') {
      return 'get@ChangeValue.com';
    }
    if (dataType === basicDataType) {
      return `Doe`;
    }
    return 'XX';
  };

  const createChangeProps = (
    dataType: EditData['dataType']
  ): Partial<EditData['profileData']> => {
    const value = getChangeValue(dataType);
    if (dataType === 'addresses') {
      return { address: value };
    }
    if (dataType === 'phones') {
      return { phone: value } as PhoneNode;
    }
    if (dataType === 'emails') {
      return { email: value } as EmailNode;
    }
    if (dataType === basicDataType) {
      return { lastName: value };
    }
    return { profileLanguage: value as Language };
  };

  const updateValue = (editData: EditData) => {
    const value = getChangeValue(editData.dataType);
    if (editData.dataType === 'addresses') {
      (editData.value as EditableAddress).address = value;
    } else if (editData.dataType === 'additional-information') {
      (editData.value as EditableAdditionalInformation).profileLanguage = value as Language;
    } else {
      editData.value = value;
    }
  };

  const isEditDataEqual = (
    editData1: EditData,
    editData2: EditData
  ): boolean => {
    const data1 = createEditDataValueFromProfileData(
      editData1.profileData,
      editData1.dataType
    );
    const data2 = createEditDataValueFromProfileData(
      editData2.profileData,
      editData2.dataType
    );
    return _.isEqual(data1, data2);
  };

  const getNodeList = (
    myProfileData: ProfileData,
    dataType: EditData['dataType']
  ): PrimaryItem[] =>
    edgesObjectToNodeList(collectAllNodes(myProfileData, dataType));

  const collectProfileDataFromEditData = (
    editItems: EditData[],
    dataType: EditData['dataType']
  ): EditData['profileData'][] => {
    const profileData = collectProfileData(editItems, dataType);
    if (dataType === 'addresses') {
      return profileData.addresses as AddressNode[];
    }
    if (dataType === 'emails') {
      return profileData.emails as EmailNode[];
    }
    if (dataType === 'phones') {
      return profileData.phones as PhoneNode[];
    }
    return [];
  };

  const compareValueToNode = (
    editItem: EditData,
    node: EditData['profileData'],
    dataType: EditData['dataType']
  ) => {
    expect(editItem.value).toEqual(
      createEditDataValueFromProfileData(node, dataType)
    );
  };

  allDataTypes.forEach(dataType => {
    describe(`creates and manipulates data for ${dataType} `, () => {
      describe('creates correct data from myProfile', () => {
        beforeEach(() => {
          testData = createTestData(dataType);
          isListDataType = !(
            dataType === basicDataType || dataType === additionalInformationType
          );
        });

        test('data of myProfile, editData, clone data, and collected data match.', () => {
          const { nodes, editItems, collectedProfileData } = testData;
          nodes.forEach((node, index) => {
            const editItem = editItems[index];
            expect(editItem.profileData).toEqual(node);
            expect(editItem.profileData).toEqual(collectedProfileData[index]);
            expect(editItem.primary).toEqual(node.primary);
            compareValueToNode(editItem, node, dataType);
            const foundIndex = findEditItemIndex(editItems, node.id);
            expect(editItems[foundIndex].profileData).toEqual(node);
          });
        });

        test('Use update functions and verify changes are stored and match when converted back and forth.', () => {
          const { nodes, editItems, clonedItems } = testData;
          nodes.forEach((node, index) => {
            const editItem = editItems[index];
            const clone = clonedItems[index];
            //update editItem
            updateValue(editItem);
            //update profileData
            updateProfileDataFromEditData(editItem);
            // use createEditDataValueFromProfileData to convert profileData back to editData.value
            expect(
              createEditDataValueFromProfileData(editItem.profileData, dataType)
            ).toEqual(editItem.value);
            //test clone has same props than original editItem
            expect(clone.profileData.id).toBe(editItem.profileData.id);
            //verify clone.profileData has not been changed
            expect(isEditDataEqual(clone, editItem)).toBeFalsy();
            //verify clone.value has not been changed
            expect(isEditDataEqual(clone, editItem)).toBeFalsy();
          });
        });
        test('hasNewItem, createNewEditItem,isNew, resetEditDataValue work properly', () => {
          if (!isListDataType) {
            return;
          }
          const { editItems } = testData;
          expect(hasNewItem(editItems)).toEqual(false);
          const newItem = createNewEditItem(dataType);
          editItems.push(newItem);
          const newItemIndex = findEditItemIndex(
            editItems,
            newItem.profileData.id
          );
          expect(editItems[newItemIndex]).toEqual(newItem);
          expect(isNew(newItem)).toEqual(true);
          expect(hasNewItem(editItems)).toEqual(true);
          // check created data has correct node type
          if (dataType === 'addresses') {
            expect((newItem.profileData as AddressNode).__typename).toEqual(
              'AddressNode'
            );
          } else if (dataType === 'phones') {
            expect((newItem.profileData as PhoneNode).__typename).toEqual(
              'PhoneNode'
            );
          } else if (dataType === 'emails') {
            expect((newItem.profileData as EmailNode).__typename).toEqual(
              'EmailNode'
            );
          }
          // check editData and profileData have same values
          compareValueToNode(newItem, createNewProfileData(dataType), dataType);
          // set new value
          updateValue(newItem);
          // verify new values
          if (dataType === 'addresses') {
            expect((newItem.value as EditableAddress).address).toEqual(
              getChangeValue(dataType)
            );
          } else if (dataType === 'phones' || dataType === 'emails') {
            expect(newItem.value).toEqual(getChangeValue(dataType));
          } else if (dataType === basicDataType) {
            expect((newItem.value as EditableUserData).lastName).toEqual(
              getChangeValue(dataType)
            );
          } else if (dataType === additionalInformationType) {
            expect(
              (newItem.value as EditableAdditionalInformation).profileLanguage
            ).toEqual(getChangeValue(dataType));
          }
          // reset value from profileData
          resetEditDataValue(newItem);
          if (dataType === 'addresses') {
            expect((newItem.value as EditableAddress).address).toEqual('');
          } else if (dataType === 'phones' || dataType === 'emails') {
            expect(newItem.value).toEqual('');
          } else if (dataType === basicDataType) {
            expect((newItem.value as EditableUserData).lastName).toEqual('');
          } else if (dataType === additionalInformationType) {
            expect(
              (newItem.value as EditableAdditionalInformation).profileLanguage
            ).toEqual(Language.FINNISH);
          }
        });
        test('Set new primary', () => {
          if (!isListDataType) {
            return;
          }
          const { editItems } = testData;
          let currentPrimary = editItems.find(
            editItem => editItem.primary
          ) as EditData;
          // do not try to set this item as primary
          const firstPrimaryId =
            currentPrimary && currentPrimary.profileData.id;
          let targetList = editItems;
          expect(firstPrimaryId).toBeDefined();
          // set all items once as primary
          editItems.forEach(editItem => {
            if (isNew(editItem)) {
              expect(() => setNewPrimary(editItems, editItem)).toThrow();
              return;
            }
            // setting current primary as primary will result in null
            if (editItem.profileData.id === firstPrimaryId) {
              expect(setNewPrimary(editItems, editItem)).toEqual(null);
              return;
            }
            targetList = setNewPrimary(editItems, editItem) as EditData[];
            // verify new primary is #0 and only primary
            const newPrimary = targetList[0];
            expect(newPrimary.primary).toBeTruthy();
            expect(
              (newPrimary.profileData as PrimaryItem).primary
            ).toBeTruthy();
            expect(
              newPrimary.profileData.id === editItem.profileData.id
            ).toBeTruthy();
            // cloned previous primary is not a primary anymore
            const oldPrimary = findEditItemIndex(targetList, currentPrimary);
            const oldInNewSet = targetList[oldPrimary];
            expect(oldInNewSet.primary).toBeFalsy();
            expect(
              (oldInNewSet.profileData as PrimaryItem).primary
            ).toBeFalsy();
            // previous primary should not be affected as items are cloned
            expect(currentPrimary.primary).toBeTruthy();
            expect(
              (currentPrimary.profileData as PrimaryItem).primary
            ).toBeTruthy();
            currentPrimary = newPrimary;
          });
        });
        test('cloning works as expected.', () => {
          const { editItems } = testData;
          const { clonedData, clonedItem } = cloneDataAndGetCurrentClone(
            editItems,
            editItems[0]
          );
          expect(clonedItem.profileData.id).toBe(editItems[0].profileData.id);
          expect(findEditItemIndex(clonedData, editItems[0])).toBe(0);
        });
        test('pickProfileData picks nothing when passed nothing', () => {
          expect(pickProfileData({} as ProfileRoot, basicDataType)).toEqual([]);
        });
        test('mergeOldEditDataToNewProfileData merges basic data', () => {
          const count = isListDataType ? 2 : 1;
          const { profile, myProfileData, editItems } = testData;
          const nodeList = isListDataType
            ? getNodeList(myProfileData, dataType)
            : [editItems[0].profileData];
          expect(nodeList).toHaveLength(count);
          const currentEditData = createEditData(profile, dataType);
          expect(currentEditData).toHaveLength(count);
          const result = mergeOldEditDataToNewProfileData(
            currentEditData,
            nodeList,
            dataType
          );
          expect(result.hasChanged).toBeFalsy();
          expect(result.items).toHaveLength(count);
          const changeValue = createChangeProps(dataType);
          if (isListDataType) {
            findAndUpdateEdgesNode(
              nodeList.map(node => ({
                node,
              })) as InsertableEdge[],
              nodeList[0].id,
              changeValue
            );
          } else {
            Object.assign(nodeList[0], changeValue);
          }

          const changeResult = mergeOldEditDataToNewProfileData(
            currentEditData,
            nodeList,
            dataType
          );
          expect(changeResult.hasChanged).toBeTruthy();
        });
      });
    });
  });
  listDataTypes.forEach(dataType => {
    describe('mergeOldEditDataToNewProfileData merges list items (addresses, emails, phones) correctly', () => {
      let initialItemsCount = -1;
      let initialNodeCount = -1;
      beforeEach(() => {
        testData = createTestData(dataType);
        initialItemsCount = testData.editItems.length;
        initialNodeCount = testData.nodes.length;
      });

      const addNewEditDataItem = (targetData: EditData[]): EditData => {
        const newItem = createNewEditItem(dataType);
        targetData.push(newItem);
        return newItem;
      };
      const removeFirstNode = (): boolean => {
        const remover =
          dataType === 'addresses'
            ? removeAddress
            : dataType === 'phones'
            ? removePhone
            : removeEmail;
        return remover(testData.myProfileData, testData.nodes[0].id);
      };
      const addThreeNewNodes = () => {
        const adder = getAddFunc(dataType);
        const creator = getCreatorFunc(dataType);

        adder(testData.myProfileData, [creator(), creator(), creator()]);
      };

      test(`All ${dataType} in profile are merged with editData.`, () => {
        const { profile, myProfileData } = testData;
        addThreeNewNodes();
        const nodeList = getNodeList(myProfileData, dataType);
        expect(nodeList).toHaveLength(initialNodeCount + 3);
        const currentEditData = createEditData(profile, dataType);
        expect(currentEditData).toHaveLength(initialItemsCount + 3);

        const result = mergeOldEditDataToNewProfileData(
          currentEditData,
          nodeList,
          dataType
        );

        expect(result.hasChanged).toBeFalsy();
        expect(result.items).toEqual(currentEditData);
      });

      test(`Removed ${dataType} is removed from editData and result.hasChanged is true `, () => {
        const { profile, myProfileData } = testData;
        addThreeNewNodes();
        const currentEditData = createEditData(profile, dataType);

        expect(removeFirstNode()).toBeTruthy();
        const removedResult = mergeOldEditDataToNewProfileData(
          currentEditData,
          getNodeList(myProfileData, dataType),
          dataType
        );
        expect(removedResult.hasChanged).toBeTruthy();
        expect(removedResult.items).toHaveLength(initialItemsCount + 3 - 1);

        const updatedNodeList = getNodeList(myProfileData, dataType);

        expect(currentEditData).toHaveLength(initialItemsCount + 3);
        expect(removedResult.items).toHaveLength(initialItemsCount + 3 - 1);
        expect(updatedNodeList).toHaveLength(initialNodeCount + 3 - 1);

        // skip first item as it has been deleted after currentEditData was created
        currentEditData.slice(1).forEach((item, index) => {
          expect(item.profileData).toEqual(updatedNodeList[index]);
          expect(item).toEqual(removedResult.items[index]);
        });
      });
      test('New editData item is kept in merge even it is not in profile data', () => {
        const { profile, myProfileData } = testData;
        removeFirstNode();
        const currentEditData = createEditData(profile, dataType);
        const newItem = addNewEditDataItem(currentEditData);
        const nodeList = getNodeList(myProfileData, dataType);
        const addResult = mergeOldEditDataToNewProfileData(
          currentEditData,
          nodeList,
          dataType
        );

        expect(addResult.items).toHaveLength(initialItemsCount - 1 + 1);
        expect(nodeList).toHaveLength(initialNodeCount - 1);
        expect(addResult.items.pop()).toEqual(newItem);
        expect(addResult.hasChanged).toBeTruthy();
      });

      test('Added profile data is merged', () => {
        const { profile, myProfileData } = testData;
        const currentEditData = createEditData(profile, dataType);
        const newItem = addNewEditDataItem(currentEditData);

        const adder = getAddFunc(dataType);
        const creator = getCreatorFunc(dataType);
        adder(myProfileData, [creator()], 1);
        const insertionNodeList = getNodeList(myProfileData, dataType);
        const insertionResult = mergeOldEditDataToNewProfileData(
          currentEditData,
          insertionNodeList,
          dataType
        );

        expect(currentEditData).toHaveLength(initialItemsCount + 1);
        expect(insertionNodeList).toHaveLength(initialNodeCount + 1);
        expect(insertionResult.items).toHaveLength(initialItemsCount + 1 + 1);

        insertionResult.items.forEach((item, index, arr) => {
          if (newItem.profileData.id !== item.profileData.id) {
            expect(item.profileData).toEqual(insertionNodeList[index]);
          } else {
            expect(index).toBe(arr.length - 1);
          }
          expect(item.profileData).toEqual(
            insertionResult.items[index].profileData
          );
        });
      });

      test('new primaries are in correct place with correct data', () => {
        const { profile, myProfileData } = testData;
        addThreeNewNodes();
        setAsPrimary(myProfileData, null, dataType);

        const currentEditData = createEditData(profile, dataType);
        expect(currentEditData).toHaveLength(initialItemsCount + 3);

        const newItem = addNewEditDataItem(currentEditData);
        const lastItem = currentEditData[currentEditData.length - 1];

        const willBeNewPrimary = currentEditData[3];
        const targetList = setNewPrimary(
          currentEditData,
          willBeNewPrimary
        ) as EditData[];

        // old non-cloned data is not affected
        expect(willBeNewPrimary.primary).toBeFalsy();
        expect(targetList[0].primary).toBeTruthy();
        expect(targetList[0]).toEqual({
          ...willBeNewPrimary,
          primary: true,
          profileData: { ...willBeNewPrimary.profileData, primary: true },
        });
        expect(targetList[targetList.length - 1]).toEqual(lastItem);
        expect(targetList).toHaveLength(currentEditData.length);

        setAsPrimary(myProfileData, willBeNewPrimary, dataType);
        const primaryNodeList = getNodeList(myProfileData, dataType);
        const primaryResult = mergeOldEditDataToNewProfileData(
          targetList,
          primaryNodeList,
          dataType
        );

        targetList.forEach((item, index, arr) => {
          if (newItem.profileData.id !== item.profileData.id) {
            expect(item.profileData).toEqual(primaryNodeList[index]);
          } else {
            expect(index).toBe(arr.length - 1);
          }
          expect(item.profileData).toEqual(
            primaryResult.items[index].profileData
          );
        });
        expect(targetList[targetList.length - 1].profileData.id).toEqual('');
      });
      test('setting item #0 as primary for the first time is detected as a change', () => {
        const { profile, myProfileData } = testData;
        // clear current primary
        setAsPrimary(myProfileData, null, dataType);
        // create editData[] after change and pick first as primary
        const currentEditData = createEditData(profile, dataType);
        const willBeNewPrimary = currentEditData[0];
        expect(willBeNewPrimary.primary).toBeFalsy();
        // set node[0] as primary
        setAsPrimary(myProfileData, willBeNewPrimary, dataType);
        // create new node list for merging
        const newNodeList = getNodeList(myProfileData, dataType);
        expect(newNodeList[0].primary).toBeTruthy();

        const result = mergeOldEditDataToNewProfileData(
          currentEditData,
          newNodeList,
          dataType
        );

        // new primary has correct props
        expect(currentEditData[0].primary).toBeTruthy();
        expect(
          (currentEditData[0].profileData as PrimaryItem).primary
        ).toBeTruthy();
        // non-value change is detected as change
        expect(result.hasChanged).toBeTruthy();
      });
    });
  });
});
