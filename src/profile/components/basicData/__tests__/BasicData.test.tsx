import React from 'react';
import { act } from '@testing-library/react';

import {
  cloneAndManipulateProfile,
  getMyProfile,
} from '../../../../common/test/myProfileMocking';
import {
  renderProfileContextWrapper,
  TestTools,
  RenderChildrenWhenDataIsComplete,
  cleanComponentMocks,
  WaitForElementAndValueProps,
  ElementSelector,
} from '../../../../common/test/componentMocking';
import { ProfileData } from '../../../../graphql/typings';
import BasicData from '../BasicData';
import {
  MockedResponse,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import { basicDataType, BasicDataValue } from '../../../helpers/editData';
import i18n from '../../../../common/test/testi18nInit';

describe('<BasicData /> ', () => {
  const responses: MockedResponse[] = [];
  const initialProfile = getMyProfile().myProfile as ProfileData;
  const renderTestSuite = () => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return renderProfileContextWrapper(
      responseProvider,
      <RenderChildrenWhenDataIsComplete>
        <BasicData />
      </RenderChildrenWhenDataIsComplete>
    );
  };
  const t = i18n.getFixedT('fi');
  const editButtonSelector: ElementSelector = { id: 'basic-data-edit-button' };
  let basicData: BasicDataValue;

  beforeEach(() => {
    responses.length = 0;
    basicData = {
      firstName: 'test-firstName',
      nickname: 'test-nickname',
      lastName: 'test-lastName',
    };
  });
  afterEach(() => {
    cleanComponentMocks();
  });

  // verify rendered data
  const verifyValues = async (
    getTextOrInputValue: TestTools['getTextOrInputValue'],
    source: Partial<BasicDataValue | ProfileData>,
    targetIsInput = false
  ) => {
    const { firstName, nickname, lastName } = source;
    const getSelector = (name: string): Record<string, string> =>
      targetIsInput
        ? { id: `${basicDataType}-${name}` }
        : { testId: `${basicDataType}-${name}-value` };
    await expect(getTextOrInputValue(getSelector('firstName'))).resolves.toBe(
      firstName
    );
    await expect(getTextOrInputValue(getSelector('nickname'))).resolves.toBe(
      nickname
    );
    await expect(getTextOrInputValue(getSelector('lastName'))).resolves.toBe(
      lastName
    );
  };

  // set new data to input fields
  const setValues = async (
    setInputValue: TestTools['setInputValue'],
    source: Partial<BasicDataValue | ProfileData>
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

  const initTests = async (): Promise<TestTools> => {
    responses.push({ profileData: initialProfile });
    const testTools = await renderTestSuite();
    await testTools.fetch();
    return Promise.resolve(testTools);
  };

  it("renders user's names - also in edit mode", async () => {
    await act(async () => {
      const { getTextOrInputValue, triggerAction } = await initTests();
      await verifyValues(getTextOrInputValue, initialProfile);
      // goto edit mode
      await triggerAction(editButtonSelector);
      await verifyValues(getTextOrInputValue, initialProfile, true);
    });
  });
  it('sends new data and returns to view mode when saved', async () => {
    // create graphQL response for the update
    const updatedProfileData = cloneAndManipulateProfile(initialProfile)
      .setBasicData(basicData)
      .getProfile();

    await act(async () => {
      const {
        triggerAction,
        setInputValue,
        submit,
        getTextOrInputValue,
      } = await initTests();
      await triggerAction(editButtonSelector);
      await setValues(setInputValue, basicData);
      // add the graphQL response
      responses.push({
        updatedProfileData,
      });

      // when submitting, find these 2 notifications
      const waitForOnSaveNotification: WaitForElementAndValueProps = {
        selector: { testId: `basic-data-save-indicator` },
        value: t('notification.saving'),
      };
      const waitForAfterSaveNotification: WaitForElementAndValueProps = {
        selector: { id: `basic-data-edit-notifications` },
        value: t('notification.saveSuccess'),
      };
      // submit and wait for saving and success notifications
      await submit({
        waitForOnSaveNotification,
        waitForAfterSaveNotification,
      });
      await verifyValues(getTextOrInputValue, basicData);
    });
  });
  it('on send error shows error notification and stays in edit mode. Cancel-button resets data', async () => {
    await act(async () => {
      const {
        triggerAction,
        setInputValue,
        submit,
        getTextOrInputValue,
      } = await initTests();
      await triggerAction(editButtonSelector);
      await setValues(setInputValue, basicData);
      // add the graphQL response
      responses.push({
        errorType: 'networkError',
      });

      const waitForAfterSaveNotification: WaitForElementAndValueProps = {
        selector: { id: `basic-data-edit-notifications` },
        value: t('notification.saveError'),
      };
      // submit and wait for saving and error notifications
      await submit({
        waitForAfterSaveNotification,
        skipDataCheck: true,
      });
      // input fields are still rendered
      await verifyValues(getTextOrInputValue, basicData, true);
      await triggerAction({
        testId: 'basic-data-cancel-button',
      });
      // values are reset to previous values
      await verifyValues(getTextOrInputValue, initialProfile);
    });
  });
});
