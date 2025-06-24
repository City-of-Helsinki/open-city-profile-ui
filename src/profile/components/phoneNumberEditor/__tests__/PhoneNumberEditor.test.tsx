import React from 'react';

import {
  cloneProfileAndProvideManipulationFunctions,
  getMyProfile,
  getProfileDataWithoutSomeNodes,
} from '../../../../common/test/myProfileMocking';
import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
  ElementSelector,
} from '../../../../common/test/testingLibraryTools';
import { PhoneNode, ProfileData } from '../../../../graphql/typings';
import {
  MockedResponse,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import { PhoneValue, EditDataType } from '../../../helpers/editData';
import i18n from '../../../../common/test/testi18nInit';
import RenderChildrenWhenDataIsComplete from '../../../../common/test/RenderChildrenWhenDataIsComplete';
import getPhonesFromNode from '../../../helpers/getPhonesFromNode';
import {
  getCountryCallingCodes,
  splitNumberAndCountryCallingCode,
} from '../../../../i18n/countryCallingCodes.utils';
import PhoneNumberEditor from '../PhoneNumberEditor';
import {
  DataSource,
  getElementSelectors,
  getNotificationMessages,
  testDataIsRendered,
  checkAddButton,
  testEditingItem,
  testAddingItem,
  testEditingItemFailsAndCancelResets,
  testInvalidValues,
  testDoubleFailing,
  testUnchangedDataIsNotSent,
  testRemovingItem,
  testAddingItemWithCancel,
  CommonTestSuite,
  ValidationTest,
} from '../../../../common/test/commonTestRuns';

describe('<PhoneNumberEditor /> ', () => {
  type PhoneValueKey = keyof PhoneValue;
  type PhoneInputKey = 'number' | 'countryCallingCode';
  type PhoneFieldKey = PhoneValueKey | PhoneInputKey;
  type PhoneNumberDataSource = Partial<PhoneValue | PhoneNode>;
  type PhoneNumberInputDataSource = Record<PhoneInputKey, string>;
  const responses: MockedResponse[] = [];
  const initialProfile = getMyProfile().myProfile as ProfileData;
  const dataType: EditDataType = 'phones';
  const renderTestSuite = () => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return renderComponentWithMocksAndContexts(
      responseProvider,
      <RenderChildrenWhenDataIsComplete>
        <PhoneNumberEditor />
      </RenderChildrenWhenDataIsComplete>
    );
  };

  const validFormValues = {
    countryCallingCode: '+358',
    number: '123456789',
  };

  const invalidFormValues = {
    countryCallingCode: '',
    number: '',
  };

  const newFormValues = {
    countryCallingCode: '+44',
    number: '06123456789',
  };

  const inputFields = ['number', 'countryCallingCode'] as PhoneInputKey[];
  const textFields = ['phone'] as PhoneValueKey[];

  const t = i18n.getFixedT('fi');

  const getProfileWithoutNodes = () =>
    getProfileDataWithoutSomeNodes({
      noNodes: true,
      dataType,
    });

  const getProfileWithPhone = (phone: PhoneValue) =>
    cloneProfileAndProvideManipulationFunctions(getProfileWithoutNodes())
      .add(dataType, { ...phone, id: '666', primary: true })
      .getProfile();

  beforeEach(() => {
    responses.length = 0;
  });

  afterEach(() => {
    cleanComponentMocks();
  });

  const getFieldValueSelector = (
    field: PhoneFieldKey,
    targetIsInput = false,
    index = 0
  ): ElementSelector => {
    if (field === 'countryCallingCode' && targetIsInput) {
      // For the dropdown, use the main button which displays the selected text
      return {
        querySelector: `#${dataType}-${index}-${field}-main-button [class^="Select-module_dropdownButtonOption"]`,
      };
    }
    return targetIsInput
      ? {
          id: `${dataType}-${index}-${field}`,
        }
      : { testId: `${dataType}-${index}-value` };
  };

  const getCountryCallingCodeLabel = (countryCode: string) => {
    if (!countryCode) {
      return '';
    }
    const countryCallingCodeOptions = getCountryCallingCodes('fi').filter(
      (option) => option.value === countryCode
    );
    return countryCallingCodeOptions && countryCallingCodeOptions.length
      ? countryCallingCodeOptions[0].label
      : '';
  };

  const dataSourceToInputDataSource = (
    dataSource: PhoneNumberDataSource
  ): PhoneNumberInputDataSource =>
    splitNumberAndCountryCallingCode(dataSource.phone as string);

  const inputDataSourceToDataSource = (
    formValues: PhoneNumberInputDataSource
  ): PhoneValue => ({
    phone: `${formValues.countryCallingCode}${formValues.number}`,
  });

  // phonenumber tests differ from others, because the data structure changes
  // between {phone} and {number,countryCallingConde}
  // this function parses their combinations to {number,countryCallingConde}
  // combinations are possible in test runs
  const multipleValuesToInputDataSource = (
    dataSource: Partial<PhoneNumberInputDataSource & PhoneValue>
  ): PhoneNumberInputDataSource => {
    if (!dataSource.phone) {
      return dataSource as PhoneNumberInputDataSource;
    }

    const { phone, ...rest } = dataSource;
    const phoneAsInputDataSource = dataSourceToInputDataSource({ phone });
    return {
      ...phoneAsInputDataSource,
      ...rest,
    };
  };

  const convertInputFieldValue = (
    source: PhoneNumberInputDataSource,
    field: PhoneInputKey
  ): string => {
    const value = source[field];

    if (field === 'number') {
      return value;
    }
    // default is "+358" so prevent that when no value is wanted
    if (!value) {
      return '';
    }
    return getCountryCallingCodeLabel(value);
  };

  const convertFieldValue = (
    source: PhoneNumberDataSource,
    field: PhoneValueKey
  ): string => {
    const value = source[field];
    return value || '';
  };

  const verifyValuesFromElements = async (
    testTools: TestTools,
    source: DataSource,
    targetIsInput = false
  ) => {
    const { getTextOrInputValue } = testTools;
    const fieldList = targetIsInput ? inputFields : textFields;
    const usedSource = targetIsInput
      ? dataSourceToInputDataSource(source as PhoneNumberDataSource)
      : source;
    for (const field of fieldList) {
      const expectedValue = targetIsInput
        ? convertInputFieldValue(
            usedSource as PhoneNumberInputDataSource,
            field as PhoneInputKey
          )
        : convertFieldValue(
            usedSource as PhoneNumberDataSource,
            field as PhoneValueKey
          );

      await expect(
        getTextOrInputValue(getFieldValueSelector(field, targetIsInput, 0))
      ).resolves.toBe(expectedValue);
    }
  };

  const setValuesToInputs = async (
    testTools: TestTools,
    source: DataSource,
    selectedFields: PhoneInputKey[] = inputFields
  ) => {
    const { setInputValue, comboBoxSelector, getTextOrInputValue } = testTools;
    for (const field of selectedFields) {
      const usedSource = multipleValuesToInputDataSource(
        source as PhoneNumberInputDataSource
      );
      const newValue = usedSource[field];
      if (field === 'countryCallingCode') {
        // comboBoxSelector will throw an error if attempting to set a value which is already set
        const label = getCountryCallingCodeLabel(newValue);
        const currentValue = await getTextOrInputValue(
          getFieldValueSelector(field, true)
        );
        if (currentValue !== label) {
          await comboBoxSelector(`${dataType}-0-${field}`, label);
        }
      } else {
        await setInputValue({
          selector: getFieldValueSelector(field, true),
          newValue,
        });
      }
    }
  };

  const commonTestProps: Exclude<CommonTestSuite, 'sentDataPicker'> = {
    selectors: getElementSelectors(dataType),
    valueSetter: setValuesToInputs,
    valueVerifier: verifyValuesFromElements,
    responses,
    notificationMessages: getNotificationMessages(t),
  };

  const initTests = async (
    profileData: ProfileData = initialProfile
  ): Promise<TestTools> => {
    responses.push({ profileData });
    const testTools = await renderTestSuite();
    await testTools.fetch();
    return Promise.resolve(testTools);
  };

  const initialPhoneInProfile = getPhonesFromNode(
    { myProfile: initialProfile },
    true
  )[0];

  const phoneNodes = getPhonesFromNode({ myProfile: initialProfile }, true);
  const usedPhoneNode = phoneNodes[0];
  const newNumberAsPhoneValue = inputDataSourceToDataSource(newFormValues);
  const validNumberAsPhoneValue = inputDataSourceToDataSource(validFormValues);

  const profileWithoutPhones = getProfileWithoutNodes();

  const getUpdatedProfile = (newPhoneValue: PhoneValue) =>
    cloneProfileAndProvideManipulationFunctions(initialProfile)
      .edit(dataType, {
        ...initialPhoneInProfile,
        ...newPhoneValue,
      })
      .getProfile();

  it("renders user's phone number - also in edit mode. Add button is not shown when phone number exists.", async () => {
    const testTools = await initTests();
    expect(phoneNodes).toHaveLength(2);
    const testSuite = {
      testTools,
      formData: usedPhoneNode,
      ...commonTestProps,
    };
    await testDataIsRendered(testSuite);
    checkAddButton(testSuite, false);
  });

  it(`sends updated data and returns to view mode when saved.
    Shows save notifications.
    Focus is returned to edit button`, async () => {
    const testTools = await initTests();

    await testEditingItem({
      testTools,
      formData: newNumberAsPhoneValue,
      assumedResponse: getUpdatedProfile(newNumberAsPhoneValue),
      sentDataPicker: (variables) =>
        (variables.input.profile.updatePhones as DataSource[])[0],
      ...commonTestProps,
    });
  });

  it('on send error shows error notification and stays in edit mode. Cancel-button resets data', async () => {
    const testTools = await initTests();
    await testEditingItemFailsAndCancelResets({
      testTools,
      formData: newNumberAsPhoneValue,
      initialValues: usedPhoneNode,
      ...commonTestProps,
    });
  });

  it('invalid values are indicated and setting a valid value removes error', async () => {
    const testTools = await initTests();

    const firstField = inputFields[0];
    const testRuns: ValidationTest[] = [
      {
        prop: firstField,
        value: invalidFormValues[firstField],
        inputSelector: getFieldValueSelector(firstField, true),
        errorSelector: { id: `${dataType}-0-${firstField}-error` },
      },
    ];

    await testInvalidValues(
      {
        testTools,
        formData: validNumberAsPhoneValue,
        initialValues: initialProfile,
        ...commonTestProps,
      },
      testRuns
    );
  });

  it(`When there is no phonenumber, the add button is rendered and an number can be added.
      Add button is not shown after it has been clicked and number is saved.`, async () => {
    const testTools = await initTests(profileWithoutPhones);
    await testAddingItem({
      testTools,
      formData: validNumberAsPhoneValue,
      assumedResponse: getProfileWithPhone(validNumberAsPhoneValue),
      sentDataPicker: (variables) =>
        (variables.input.profile.addPhones as unknown as DataSource[])[0],
      ...commonTestProps,
    });
  });

  it(`When removing an phonenumber, a confirmation modal is shown.
      Remove error is handled and shown.
      When removal is complete, add button is shown and a text about no phones.`, async () => {
    const testTools = await initTests(
      getProfileWithPhone(validNumberAsPhoneValue)
    );
    await testRemovingItem({
      testTools,
      assumedResponse: profileWithoutPhones,
      ...commonTestProps,
    });
  });

  it(`When a new number is cancelled, nothing is saved and
      add button is shown and a text about no phone numbers.
      Focus is returned to add button`, async () => {
    const testTools = await initTests(profileWithoutPhones);
    await testAddingItemWithCancel(
      {
        testTools,
        formData: validNumberAsPhoneValue,
        ...commonTestProps,
      },
      true
    );
  });

  it('When user saves without making changes, data is not sent, but save success is shown.', async () => {
    const testTools = await initTests();
    await testUnchangedDataIsNotSent({
      testTools,
      formData: usedPhoneNode,
      initialValues: usedPhoneNode,
      ...commonTestProps,
    });
  });

  it('When saving fails twice, the second one does result in save success, because data did not change.', async () => {
    const testTools = await initTests();
    await testDoubleFailing({
      testTools,
      formData: newNumberAsPhoneValue,
      initialValues: usedPhoneNode,
      assumedResponse: getUpdatedProfile(newNumberAsPhoneValue),
      ...commonTestProps,
    });
  });
});
