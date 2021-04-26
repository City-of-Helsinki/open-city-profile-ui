import React from 'react';
import { act } from '@testing-library/react';

import {
  cloneProfileAndProvideManipulationFunctions,
  getMyProfile,
} from '../../../../common/test/myProfileMocking';
import {
  renderComponentWithMocksAndContexts,
  TestTools,
  RenderChildrenWhenDataIsComplete,
  cleanComponentMocks,
  WaitForElementAndValueProps,
  ElementSelector,
  submitButtonSelector,
  waitForElementAttributeValue,
} from '../../../../common/test/componentMocking';
import { ProfileData } from '../../../../graphql/typings';
import BasicData from '../BasicData';
import {
  MockedResponse,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import { basicDataType, BasicDataValue } from '../../../helpers/editData';
import i18n from '../../../../common/test/testi18nInit';
import { getFormFields } from '../../../helpers/formProperties';

describe('<BasicData /> ', () => {
  const responses: MockedResponse[] = [];
  const initialProfile = getMyProfile().myProfile as ProfileData;
  const renderTestSuite = () => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return renderComponentWithMocksAndContexts(
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
      const { getTextOrInputValue, clickElement } = await initTests();
      await verifyValues(getTextOrInputValue, initialProfile);
      // goto edit mode
      await clickElement(editButtonSelector);
      await verifyValues(getTextOrInputValue, initialProfile, true);
    });
  });
  it('sends new data and returns to view mode when saved', async () => {
    // create graphQL response for the update
    const updatedProfileData = cloneProfileAndProvideManipulationFunctions(
      initialProfile
    )
      .setBasicData(basicData)
      .getProfile();

    await act(async () => {
      const {
        clickElement,
        setInputValue,
        submit,
        getTextOrInputValue,
      } = await initTests();
      await clickElement(editButtonSelector);
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
        clickElement,
        setInputValue,
        submit,
        getTextOrInputValue,
      } = await initTests();
      await clickElement(editButtonSelector);
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
      await clickElement({
        testId: 'basic-data-cancel-button',
      });
      // values are reset to previous values
      await verifyValues(getTextOrInputValue, initialProfile);
    });
  });
  it('invalid values are indicated and setting a valid value removes error', async () => {
    await act(async () => {
      const { clickElement, setInputValue, getElement } = await initTests();
      const formFields = getFormFields(basicDataType);
      await clickElement(editButtonSelector);
      const testRuns = [
        {
          validData: basicData,
          invalidData: { ...basicData, firstName: '' },
          elementSelector: { id: 'basic-data-firstName' },
          errorSelector: {
            id: 'basic-data-firstName-helper',
          },
        },
        {
          validData: basicData,
          invalidData: { ...basicData, lastName: '' },
          elementSelector: { id: 'basic-data-lastName' },
          errorSelector: {
            id: 'basic-data-lastName-helper',
          },
        },
        {
          validData: basicData,
          invalidData: {
            ...basicData,
            nickname: String('a').repeat(
              (formFields.nickname.max as number) + 1
            ),
          },
          elementSelector: { id: 'basic-data-nickname' },
          errorSelector: {
            id: 'basic-data-nickname-helper',
          },
        },
      ];

      // cannot use forEach with async/await
      for (const runProps of testRuns) {
        const {
          validData,
          invalidData,
          elementSelector,
          errorSelector,
        } = runProps;
        const elementGetter = () => getElement(elementSelector);
        const errorElementGetter = () => getElement(errorSelector);

        // set invalid values
        await setValues(setInputValue, invalidData);
        // submit also validates the form
        await clickElement(submitButtonSelector);
        await waitForElementAttributeValue(
          elementGetter,
          'aria-invalid',
          'true'
        );
        // getElement throws if element is not found
        expect(() => errorElementGetter).not.toThrow();
        // set valid value
        await setValues(setInputValue, validData);
        await waitForElementAttributeValue(
          elementGetter,
          'aria-invalid',
          'false'
        );
        expect(errorElementGetter).toThrow();
      }
    });
  });
});
