import React from 'react';

import { getMyProfile } from '../../../../common/test/myProfileMocking';
import EditableBasicData from '../EditableBasicData';
import { renderProfileContextWrapper } from '../../../../common/test/componentMocking';
import { createMutationMocksAndTestData } from '../../../../common/test/graphQLDataMocking';
import {
  basicDataType,
  EditableUserData,
  EditData,
} from '../../../helpers/mutationEditor';
import { MyProfileQuery_myProfile as MyProfileData } from '../../../../graphql/generatedTypes';

describe('<EditableBasicData />', () => {
  const testData = createMutationMocksAndTestData(basicDataType, [
    { action: 'edit', id: '' },
    { action: 'error', id: '' },
  ]);

  const renderEditableBasicData = () =>
    renderProfileContextWrapper(
      testData.mocks,
      <EditableBasicData />,
      basicDataType
    );

  const saveResultValue = (testData.modifiedEditData[0] as EditData)
    .value as EditableUserData;
  const errorSaveProps = (testData.modifiedEditData[1] as EditData)
    .value as EditableUserData;

  it("should render user's names, render form and save new data and show notifications to user", async () => {
    const {
      submit,
      setInputValue,
      triggerAction,
      getTextOrInputValue,
      createWaitForElement,
    } = await renderEditableBasicData();

    // verify rendered data
    const verifyValues = async (
      source: Partial<EditableUserData | MyProfileData>
    ) => {
      const { firstName, nickname, lastName } = source;
      await expect(
        getTextOrInputValue({ testId: 'basic-data-firstName-value' })
      ).resolves.toBe(firstName);
      await expect(
        getTextOrInputValue({ testId: 'basic-data-nickname-value' })
      ).resolves.toBe(nickname);
      await expect(
        getTextOrInputValue({ testId: 'basic-data-lastName-value' })
      ).resolves.toBe(lastName);
    };

    // set new data to input fields
    const setValues = async (
      source: Partial<EditableUserData | MyProfileData>
    ) => {
      const { firstName, nickname, lastName } = source;
      await setInputValue({
        selector: { id: 'basic-data-firstName' },
        newValue: firstName as string,
      });
      await setInputValue({
        selector: { id: 'basic-data-nickname' },
        newValue: nickname as string,
      });
      await setInputValue({
        selector: { id: 'basic-data-lastName' },
        newValue: lastName as string,
      });
    };

    // component shows myProfile data on first load
    await verifyValues(getMyProfile().myProfile as MyProfileData);
    // goto edit mode
    await triggerAction({ id: 'basic-data-edit-button' });
    // set new values from testData
    await setValues(saveResultValue);
    // submit and wait for notifications
    await submit({
      checkNotificationContent: 'notification.saving',
      waitForResult: createWaitForElement(
        { id: `basic-data-edit-notifications` },
        'notification.saveSuccess'
      ),
    });

    // verify new values
    await verifyValues(saveResultValue);

    // goto edit mode
    await triggerAction({ id: 'basic-data-edit-button' });
    // set values that will result an error
    await setValues(errorSaveProps);
    // submit and wait for error
    await submit({
      checkNotificationContent: 'notification.saving',
      waitForResult: createWaitForElement(
        { id: 'basic-data-edit-notifications' },
        'notification.saveError'
      ),
    });
    // cancel edits
    await triggerAction({ testId: 'basic-data-cancel-button' });
    // verify pre-edit-mode data is restored
    await verifyValues(saveResultValue);
  });
});
