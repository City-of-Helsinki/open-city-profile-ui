import React from 'react';
import { act } from '@testing-library/react';

import {
  cloneProfileAndProvideManipulationFunctions,
  getMyProfile,
  getProfileDataWithoutSomeNodes,
} from '../../../../common/test/myProfileMocking';
import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
  WaitForElementAndValueProps,
  ElementSelector,
  submitButtonSelector,
  waitForElementAttributeValue,
  waitForElementFocus,
} from '../../../../common/test/testingLibraryTools';
import { PhoneNode, ProfileData } from '../../../../graphql/typings';
import MultiItemEditor from '../../multiItemEditor/MultiItemEditor';
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

describe('<MultiItemPhoneRow /> ', () => {
  type PhoneValueKey = keyof PhoneValue;
  type PhoneInputKey = 'number' | 'countryCallingCode';
  type PhoneFieldKey = PhoneValueKey | PhoneInputKey;
  type DataSource = Partial<PhoneValue | PhoneNode>;
  type InputDataSource = Record<PhoneInputKey, string>;
  const responses: MockedResponse[] = [];
  const initialProfile = getMyProfile().myProfile as ProfileData;
  const dataType: EditDataType = 'phones';
  const renderTestSuite = () => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return renderComponentWithMocksAndContexts(
      responseProvider,
      <RenderChildrenWhenDataIsComplete>
        <MultiItemEditor dataType={dataType} />
      </RenderChildrenWhenDataIsComplete>
    );
  };

  // test only node at index 0;
  const testIndex = 0;
  const selectors: Record<string, ElementSelector> = {
    editButton: { id: `${dataType}-#index#-edit-button` },
    addButton: { id: `${dataType}-add-button` },
    removeButton: { id: `${dataType}-#index#-remove-button` },
    confirmRemovalButton: {
      testId: 'confirmation-modal-confirm-button',
    },
    noDataText: {
      testId: `${dataType}-no-data`,
    },
    cancelButton: {
      testId: `${dataType}-#index#-cancel-button`,
    },
    editNotifications: {
      id: `${dataType}-edit-notifications`,
    },
  };

  const getSelector = (type: string, index = 0): ElementSelector => {
    const selector = selectors[type];
    const selectorAttribute = selector.id ? 'id' : 'testId';
    const value = String(selector[selectorAttribute]);
    return { [selectorAttribute]: value.replace('#index#', String(index)) };
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
      return {
        id: `${dataType}-${index}-${field}-input`,
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
      option => option.value === countryCode
    );
    return countryCallingCodeOptions && countryCallingCodeOptions.length
      ? countryCallingCodeOptions[0].label
      : '';
  };

  const dataSourceToInputDataSource = (
    dataSource: DataSource
  ): InputDataSource =>
    splitNumberAndCountryCallingCode(dataSource.phone as string);

  const inputDataSourceToDataSource = (
    formValues: InputDataSource
  ): DataSource => ({
    phone: `${formValues.countryCallingCode}${formValues.number}`,
  });

  const convertInputFieldValue = (
    source: InputDataSource,
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
    source: DataSource,
    field: PhoneValueKey
  ): string => {
    const value = source[field];
    return value || '';
  };

  const verifyValuesFromElements = async (
    testTools: TestTools,
    source: DataSource | InputDataSource,
    targetIsInput = false,
    index = 0
  ) => {
    const { getTextOrInputValue } = testTools;
    const fieldList = targetIsInput ? inputFields : textFields;
    for (const field of fieldList) {
      const expectedValue = targetIsInput
        ? convertInputFieldValue(
            source as InputDataSource,
            field as PhoneInputKey
          )
        : convertFieldValue(source as DataSource, field as PhoneValueKey);

      await expect(
        getTextOrInputValue(getFieldValueSelector(field, targetIsInput, index))
      ).resolves.toBe(expectedValue);
    }
  };

  const setValuesToInputs = async (
    testTools: TestTools,
    source: InputDataSource,
    selectedFields: PhoneInputKey[] = inputFields
  ) => {
    const { setInputValue, comboBoxSelector, getTextOrInputValue } = testTools;
    for (const field of selectedFields) {
      const newValue = source[field];
      if (field === 'countryCallingCode') {
        // comboBoxSelector will throw an error if attempting to set a value which is already set
        const label = getCountryCallingCodeLabel(newValue);
        const currentValue = await getTextOrInputValue(
          getFieldValueSelector(field, true)
        );
        if (currentValue !== label) {
          await comboBoxSelector(`${dataType}-${testIndex}-${field}`, label);
        }
      } else {
        await setInputValue({
          selector: getFieldValueSelector(field, true),
          newValue,
        });
      }
    }
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

  it("renders all user's phone numbers - also in edit mode. Add button is not shown.", async () => {
    await act(async () => {
      const testTools = await initTests();
      const { clickElement, getElement } = testTools;
      expect(phoneNodes).toHaveLength(2);
      let index = 0;
      for (const node of phoneNodes) {
        await verifyValuesFromElements(testTools, node, false, index);
        // goto edit mode
        await clickElement(getSelector('editButton', index));
        await verifyValuesFromElements(
          testTools,
          dataSourceToInputDataSource(node),
          true,
          index
        );
        index += 1;
      }
      expect(() => getElement(getSelector('addButton'))).toThrow();
    });
  });

  it(`sends updated data and returns to view mode when saved. 
      Shows save notifications. 
      Focus is returned to edit button`, async () => {
    await act(async () => {
      const testTools = await initTests();
      const { clickElement, submit, getElement } = testTools;
      await clickElement(getSelector('editButton'));
      await setValuesToInputs(testTools, newFormValues);

      // create graphQL response for the update
      const updatedProfileData = cloneProfileAndProvideManipulationFunctions(
        initialProfile
      )
        .edit(dataType, {
          ...initialPhoneInProfile,
          ...inputDataSourceToDataSource(newFormValues),
        })
        .getProfile();

      // add the graphQL response
      responses.push({
        updatedProfileData,
      });

      const waitForOnSaveNotification: WaitForElementAndValueProps = {
        selector: { testId: `${dataType}-${testIndex}-save-indicator` },
        value: t('notification.saving'),
      };

      const waitForAfterSaveNotification: WaitForElementAndValueProps = {
        selector: getSelector('editNotifications'),
        value: t('notification.saveSuccess'),
      };
      // submit and wait for "saving" and "saveSuccess" notifications
      await submit({
        waitForOnSaveNotification,
        waitForAfterSaveNotification,
      });
      // verify new values are visible
      await verifyValuesFromElements(
        testTools,
        inputDataSourceToDataSource(newFormValues)
      );
      // focus is set to edit button
      await waitForElementFocus(() => getElement(getSelector('editButton')));
    });
  });

  it('on send error shows error notification and stays in edit mode. Cancel-button resets data', async () => {
    await act(async () => {
      const testTools = await initTests();
      const { clickElement, submit } = testTools;
      await clickElement(getSelector('editButton'));
      await setValuesToInputs(testTools, newFormValues);

      // add the graphQL response
      responses.push({
        errorType: 'networkError',
      });

      const waitForAfterSaveNotification: WaitForElementAndValueProps = {
        selector: getSelector('editNotifications'),
        value: t('notification.saveError'),
      };

      // submit and wait for saving and error notifications
      await submit({
        waitForAfterSaveNotification,
        skipDataCheck: true,
      });

      // input fields are still rendered
      await verifyValuesFromElements(testTools, newFormValues, true);
      // cancel edits
      await clickElement({
        testId: `${dataType}-${testIndex}-cancel-button`,
      });
      // values are reset to previous values
      await verifyValuesFromElements(testTools, initialPhoneInProfile);
    });
  });
  inputFields.forEach(async field => {
    it(`invalid value for ${field} is indicated and setting a valid value removes the error`, async () => {
      const testTools = await initTests();
      const { clickElement, getElement } = testTools;
      await act(async () => {
        const fieldValueSelector = getFieldValueSelector(field, true);
        await clickElement(getSelector('editButton'));
        const elementGetter = () => getElement(fieldValueSelector);
        const errorElementGetter = () =>
          getElement({ id: `${dataType}-${testIndex}-${field}-error` });
        const errorListElementGetter = () =>
          getElement({ testId: `${dataType}-error-list` });

        const invalidValues = {
          ...validFormValues,
          ...{ [field]: invalidFormValues[field] },
        };
        // set invalid value to the field
        await setValuesToInputs(testTools, invalidValues, [field]);
        // submit also validates the form
        await clickElement(submitButtonSelector);
        await waitForElementAttributeValue(elementGetter, 'aria-invalid', true);
        // error element and list are found
        expect(errorElementGetter).not.toThrow();
        expect(errorListElementGetter).not.toThrow();
        // set valid value to the field
        await setValuesToInputs(testTools, validFormValues, [field]);
        await waitForElementAttributeValue(
          elementGetter,
          'aria-invalid',
          false
        );
        // error element and list are not found
        expect(errorElementGetter).toThrow();
        expect(errorListElementGetter).toThrow();
      });
    });
  });
  it(`When there is no phone number, the add button is rendered and a number can be added. 
      Add button is not shown after it has been clicked and number is saved.`, async () => {
    await act(async () => {
      const profileWithoutPhones = getProfileWithoutNodes();
      const testTools = await initTests(profileWithoutPhones);
      const {
        clickElement,
        getElement,
        submit,
        getTextOrInputValue,
      } = testTools;

      // edit button is not rendered
      expect(() => getElement(getSelector('editButton'))).toThrow();

      // info text is shown instead of an number
      await expect(
        getTextOrInputValue(getSelector('noDataText'))
      ).resolves.toBe(t('profileInformation.noPhone'));
      // click add button to create an number
      await clickElement(getSelector('addButton'));
      expect(() => getElement(getSelector('addButton'))).toThrow();
      await setValuesToInputs(testTools, validFormValues);

      // create the graphQL response
      const profileWithPhone = getProfileWithPhone(
        inputDataSourceToDataSource(validFormValues) as PhoneValue
      );

      // add the graphQL response
      responses.push({ updatedProfileData: profileWithPhone });

      const waitForAfterSaveNotification: WaitForElementAndValueProps = {
        selector: getSelector('editNotifications'),
        value: t('notification.saveSuccess'),
      };

      await submit({
        skipDataCheck: true,
        waitForAfterSaveNotification,
      });

      await verifyValuesFromElements(
        testTools,
        inputDataSourceToDataSource(validFormValues)
      );
      expect(() => getElement(getSelector('addButton'))).toThrow();
    });
  });
  it(`When removing a phone number, a confirmation modal is shown. 
      Remove error is handled and shown.
      When removal is complete, add button is shown and a text about no phone numbers.`, async () => {
    await act(async () => {
      const profileWithoutPhones = getProfileWithoutNodes();
      const profileWithPhone = getProfileWithPhone(
        inputDataSourceToDataSource(validFormValues) as PhoneValue
      );

      const {
        clickElement,
        getElement,
        waitForElementAndValue,
        waitForElement,
      } = await initTests(profileWithPhone);

      // add error response
      responses.push({
        errorType: 'networkError',
      });
      // add the graphQL response
      responses.push({
        updatedProfileData: profileWithoutPhones,
      });

      expect(() => getElement(getSelector('addButton'))).toThrow();
      // click remove button, confirm removal and handle error
      await clickElement(getSelector('removeButton'));
      await waitForElement(getSelector('confirmRemovalButton'));
      await clickElement(getSelector('confirmRemovalButton'));

      await waitForElementAndValue({
        selector: getSelector('editNotifications'),
        value: t('notification.removeError'),
      });

      // start removal again
      await clickElement(getSelector('removeButton'));
      await waitForElement(getSelector('confirmRemovalButton'));
      await clickElement(getSelector('confirmRemovalButton'));

      await waitForElementAndValue({
        selector: getSelector('editNotifications'),
        value: t('notification.removeSuccess'),
      });
      // item is removed and also remove button
      expect(() => getElement(getSelector('removeButton'))).toThrow();
      expect(() => getElement(getSelector('addButton'))).not.toThrow();
      expect(() => getElement(getSelector('noDataText'))).not.toThrow();
    });
  });
  it(`When a new phone number is cancelled, nothing is saved and
      add button is shown and a text about no phone numbers.
      Focus is returned to add button`, async () => {
    await act(async () => {
      const profileWithoutPhones = getProfileWithoutNodes();
      const {
        clickElement,
        getElement,
        getTextOrInputValue,
        waitForElement,
      } = await initTests(profileWithoutPhones);

      await clickElement(getSelector('addButton'));
      await waitForElement(getSelector('cancelButton'));
      await expect(
        getTextOrInputValue(getFieldValueSelector('number', true))
      ).resolves.toBe('');
      expect(() => getElement(getSelector('removeButton'))).toThrow();
      expect(() => getElement(getSelector('addButton'))).toThrow();

      await clickElement(getSelector('cancelButton'));

      expect(() => getElement(getSelector('addButton'))).not.toThrow();
      expect(() => getElement(getSelector('noDataText'))).not.toThrow();
      // focus is set to add button
      await waitForElementFocus(() => getElement(getSelector('addButton')));
    });
  });
});
