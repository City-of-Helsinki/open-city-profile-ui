import React from 'react';
import { act } from '@testing-library/react';

import {
  cloneProfileAndProvideManipulationFunctions,
  getMyProfile,
} from '../../../../common/test/myProfileMocking';
import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
} from '../../../../common/test/testingLibraryTools';
import { ProfileData } from '../../../../graphql/typings';
import BasicData from '../BasicData';
import {
  MockedResponse,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import { basicDataType, BasicDataValue } from '../../../helpers/editData';
import i18n from '../../../../common/test/testi18nInit';
import { getFormFields } from '../../../helpers/formProperties';
import RenderChildrenWhenDataIsComplete from '../../../../common/test/RenderChildrenWhenDataIsComplete';
import {
  testDataIsRendered,
  testEditingItemFailsAndCancelResets,
  testEditingItem,
  testInvalidValues,
  DataSource,
  ValidationTest,
  getElementSelectors,
  getNotificationMessages,
  CommonTestSuite,
} from '../../../../common/test/commonTestRuns';

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
    testTools: TestTools,
    source: DataSource,
    targetIsInput = false
  ) => {
    const { getTextOrInputValue } = testTools;
    const { firstName, nickname, lastName } = source as Partial<
      BasicDataValue | ProfileData
    >;
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
  const setValues = async (testTools: TestTools, source: DataSource) => {
    const { setInputValue } = testTools;
    const { firstName, nickname, lastName } = source as BasicDataValue;
    await setInputValue({
      selector: { id: 'basic-data-firstName' },
      newValue: firstName,
    });
    await setInputValue({
      selector: { id: 'basic-data-nickname' },
      newValue: nickname,
    });
    await setInputValue({
      selector: { id: 'basic-data-lastName' },
      newValue: lastName,
    });
  };

  const initTests = async (
    profileData = initialProfile
  ): Promise<TestTools> => {
    responses.push({ profileData });
    const testTools = await renderTestSuite();
    await testTools.fetch();
    return Promise.resolve(testTools);
  };

  const getUpdatedProfile = (update: BasicDataValue) =>
    cloneProfileAndProvideManipulationFunctions(initialProfile)
      .setBasicData(update)
      .getProfile();

  const commonTestProps: CommonTestSuite = {
    selectors: getElementSelectors(basicDataType),
    valueSetter: setValues,
    valueVerifier: verifyValues,
    responses,
    notificationMessages: getNotificationMessages(t),
    sentDataPicker: variables => variables.input.profile as DataSource,
  };

  const originalData = {
    firstName: initialProfile.firstName,
    nickname: initialProfile.nickname,
    lastName: initialProfile.lastName,
  };

  it("renders user's names - also in edit mode", async () => {
    await act(async () => {
      const testTools = await initTests();
      await testDataIsRendered({
        testTools,
        formData: originalData,
        ...commonTestProps,
      });
    });
  });

  it('sends new data and returns to view mode when saved', async () => {
    await act(async () => {
      const testTools = await initTests();
      await testEditingItem({
        testTools,
        formData: basicData,
        assumedResponse: getUpdatedProfile(basicData),
        ...commonTestProps,
      });
    });
  });

  it('on send error shows error notification and stays in edit mode. Cancel-button resets data', async () => {
    await act(async () => {
      const testTools = await initTests();
      await testEditingItemFailsAndCancelResets({
        testTools,
        formData: basicData,
        initialValues: initialProfile,
        ...commonTestProps,
      });
    });
  });

  it('invalid values are indicated and setting a valid value removes error', async () => {
    await act(async () => {
      const testTools = await initTests();
      const formFields = getFormFields(basicDataType);
      const testRuns: ValidationTest[] = [
        {
          prop: 'firstName',
          value: '',
          inputSelector: { id: 'basic-data-firstName' },
          errorSelector: {
            id: 'basic-data-firstName-error',
          },
        },
        {
          prop: 'lastName',
          value: '',
          inputSelector: { id: 'basic-data-lastName' },
          errorSelector: {
            id: 'basic-data-lastName-error',
          },
        },
        {
          prop: 'nickname',
          value: String('a').repeat((formFields.nickname.max as number) + 1),
          inputSelector: { id: 'basic-data-nickname' },
          errorSelector: {
            id: 'basic-data-nickname-error',
          },
        },
      ];
      await testInvalidValues(
        {
          testTools,
          formData: basicData,
          initialValues: initialProfile,
          ...commonTestProps,
        },
        testRuns
      );
    });
  });

  it('empty value should have aria-hidden true in parent', async () => {
    await act(async () => {
      const testTools = await initTests({ ...initialProfile, nickname: '' });
      const { findByTestId } = testTools;

      expect(
        (
          await findByTestId(`${basicDataType}-nickname-label`)
        ).parentElement?.getAttribute('aria-hidden')
      ).toEqual('true');
    });
  });
});
