import React from 'react';
import Modal from 'react-modal';
import { act } from 'react-dom/test-utils';

import {
  findNodeById,
  getMyProfile,
} from '../../../../common/test/myProfileMocking';
import ProfileDataEditor from '../ProfileDataEditor';
import {
  renderProfileContextWrapper,
  TestTools,
} from '../../../../common/test/componentMocking';
import { createMutationMocksAndTestData } from '../../../../common/test/graphQLDataMocking';
import {
  EditableAddress,
  EditableEmail,
  EditablePhone,
  EditData,
} from '../../../helpers/mutationEditor';
import { ProfileData, InsertableNode } from '../../../../graphql/typings';

type InputSource = Partial<EditableAddress | ProfileData> | string;

describe('<ProfileDataEditor />', () => {
  const listDataTypes: EditData['dataType'][] = [
    'addresses',
    'emails',
    'phones',
  ];

  // verify rendered data
  const verifyValues = async (
    dataType: EditData['dataType'],
    source: InputSource,
    getTextOrInputValue: TestTools['getTextOrInputValue'],
    index: number
  ): Promise<void> => {
    const testId = `${dataType}-${index}`;
    if (dataType === 'emails') {
      const value =
        typeof source === 'string' ? source : (source as EditableEmail).email;
      await expect(
        getTextOrInputValue({ testId: `${testId}-value` })
      ).resolves.toBe(value);
    } else if (dataType === 'phones') {
      const value =
        typeof source === 'string' ? source : (source as EditablePhone).phone;
      await expect(
        getTextOrInputValue({ testId: `${testId}-value` })
      ).resolves.toBe(value);
    } else if (dataType === 'addresses') {
      const { address, city, postalCode } = source as EditableAddress;
      await expect(
        getTextOrInputValue({ testId: `${testId}-address-value` })
      ).resolves.toBe(address);
      await expect(
        getTextOrInputValue({ testId: `${testId}-city-value` })
      ).resolves.toBe(city);
      await expect(
        getTextOrInputValue({ testId: `${testId}-postalCode-value` })
      ).resolves.toBe(postalCode);
    }
    return Promise.resolve();
  };

  // set new data to input field(s)
  const setValues = async (
    dataType: EditData['dataType'],
    source: InputSource,
    setInputValue: TestTools['setInputValue'],
    index: number
  ): Promise<void> => {
    const testId = `${dataType}-${index}`;
    if (dataType === 'emails' || dataType === 'phones') {
      await setInputValue({
        selector: { id: `${testId}-value` },
        newValue: source as string,
      });
    } else if (dataType === 'addresses') {
      const { address, city, postalCode } = source as EditableAddress;
      await setInputValue({
        selector: { id: `${testId}-address` },
        newValue: address,
      });
      await setInputValue({
        selector: { id: `${testId}-postalCode` },
        newValue: postalCode,
      });
      await setInputValue({
        selector: { id: `${testId}-city` },
        newValue: city,
      });
    }
    return Promise.resolve();
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const globalDocument = global.document;

  const pressDialogConfirmButton = () => {
    const dialog = globalDocument.body.querySelector('[role="dialog"]');
    const buttons = dialog.querySelector('.actions').querySelectorAll('button');
    buttons[0].click();
  };

  // toast requires some magic
  beforeAll(() => {
    const toastRoot = globalDocument.createElement('div');
    Modal.setAppElement(toastRoot);
    toastRoot.setAttribute('id', 'toast-root');
    globalDocument.body.appendChild(toastRoot);
  });

  afterAll(() => {
    globalDocument.getElementById('toast-root').remove();
  });

  listDataTypes.forEach(dataType => {
    describe(` handles ${dataType} `, () => {
      const myProfile = getMyProfile().myProfile as ProfileData;

      const testData = createMutationMocksAndTestData(dataType, [
        { action: 'edit', id: '123' },
        { action: 'error', id: '123' },
        { action: 'set-primary', id: '234' },
        { action: 'remove', id: '123' },
        { action: 'add', id: '' },
      ]);

      const saveNode = findNodeById(
        myProfile,
        dataType,
        '123'
      ) as InsertableNode;

      const saveResultValue = (testData.modifiedEditData[0] as EditData).value;
      const addResultValue = (testData.modifiedEditData[4] as EditData).value;

      const renderProfileDataEditor = () =>
        renderProfileContextWrapper(
          testData.mocks,
          <ProfileDataEditor dataType={dataType} />
        );

      it('and renders data and a form, saves new data and shows notifications to user', async () => {
        const {
          submit,
          setInputValue,
          triggerAction,
          getTextOrInputValue,
          createWaitForElement,
          getByTestId,
          isDisabled,
          getElement,
        } = await renderProfileDataEditor();

        const testId = `${dataType}-0`;
        const getId = (suffix: string): string => `${testId}-${suffix}`;

        // component shows myProfile data on first load
        await verifyValues(dataType, saveNode, getTextOrInputValue, 0);
        // goto edit mode
        await triggerAction({ id: getId('edit-button') });
        // set new values from testData
        await setValues(
          dataType,
          saveResultValue as InputSource,
          setInputValue,
          0
        );
        // submit and wait for notifications
        await submit({
          checkNotificationContent: 'notification.saving',
          waitForResult: createWaitForElement(
            { id: `${dataType}-edit-notifications` },
            'notification.saveSuccess'
          ),
        });
        // goto edit mode
        await triggerAction({ id: getId('edit-button') });
        // set values that will result an error
        await submit({
          waitForResult: createWaitForElement(
            { id: `${dataType}-edit-notifications` },
            'notification.saveError'
          ),
        });
        // cancel edits
        await triggerAction({ testId: getId('cancel-button') });
        // verify pre-edit-mode data is restored
        await verifyValues(
          dataType,
          saveResultValue as InputSource,
          getTextOrInputValue,
          0
        );

        const waitForSetPrimaryNotification = createWaitForElement(
          { id: `${dataType}-edit-notifications` },
          'notification.genericSuccess'
        );
        // change primary
        await triggerAction({
          testId: `${dataType}-1-set-primary-button`,
        });
        // check notifications
        await waitForSetPrimaryNotification();

        // verify first item has no remove button
        expect(() =>
          getElement({
            testId: `${dataType}-0-remove-button`,
          })
        ).toThrow();

        // verify second item has a remove button
        const removeButton2 = getElement({
          testId: `${dataType}-1-remove-button`,
        });
        expect(!!removeButton2).toBeTruthy();

        const waitForRemoveNotification = createWaitForElement(
          { id: `${dataType}-edit-notifications` },
          'notification.removeSuccess'
        );
        // verify there are two items by checking last one has primary button
        getByTestId(`${dataType}-1-set-primary-button`);
        // press remove button
        await triggerAction({
          testId: `${dataType}-1-remove-button`,
        });
        // confirm dialog
        act(() => {
          pressDialogConfirmButton();
        });
        // wait for notification
        await waitForRemoveNotification();

        // verify there is only one element by checking primary button for second element is missing
        expect(() => getByTestId(`${dataType}-1-set-primary-button`)).toThrow();

        // add new data
        await triggerAction({
          id: `${dataType}-add-button`,
        });

        // verify add button is disabled while new item is shown
        const addButton = getElement({
          id: `${dataType}-add-button`,
        });
        expect(!!addButton && isDisabled(addButton)).toBeTruthy();
        // add new values
        await setValues(
          dataType,
          addResultValue as InputSource,
          setInputValue,
          1
        );

        // save
        await submit({
          checkNotificationContent: 'notification.saving',
          waitForResult: createWaitForElement(
            { id: `${dataType}-edit-notifications` },
            'notification.saveSuccess'
          ),
        });

        //verify new values rendered
        await verifyValues(
          dataType,
          addResultValue as InputSource,
          getTextOrInputValue,
          1
        );

        // verify add button is enabled again
        const addButtonAfterSave = getElement({
          id: `${dataType}-add-button`,
        });
        expect(
          !!addButtonAfterSave && !isDisabled(addButtonAfterSave)
        ).toBeTruthy();
      });
    });
  });
});
