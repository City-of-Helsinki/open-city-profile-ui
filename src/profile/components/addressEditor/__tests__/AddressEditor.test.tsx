import React from 'react';
import { act } from '@testing-library/react';
import countries from 'i18n-iso-countries';

import {
  cloneProfileAndProvideManipulationFunctions,
  getMyProfile,
  getProfileDataWithoutSomeNodes,
  getVerifiedData,
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
import { AddressNode, ProfileData } from '../../../../graphql/typings';
import {
  MockedResponse,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import { AddressValue, EditDataType } from '../../../helpers/editData';
import i18n from '../../../../common/test/testi18nInit';
import RenderChildrenWhenDataIsComplete from '../../../../common/test/RenderChildrenWhenDataIsComplete';
import getAddressesFromNode from '../../../helpers/getAddressesFromNode';
import AddressEditor from '../AddressEditor';
import {
  getCommonElementSelector,
  testAddWithCancel,
} from '../../../../common/test/commonTestRuns';

describe('<AddressEditor /> ', () => {
  type AddressValueKey = keyof AddressValue;
  type DataSource = Partial<AddressValue | AddressNode>;
  const responses: MockedResponse[] = [];
  const initialProfile = getMyProfile().myProfile as ProfileData;
  const dataType: EditDataType = 'addresses';
  const renderTestSuite = () => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return renderComponentWithMocksAndContexts(
      responseProvider,
      <RenderChildrenWhenDataIsComplete>
        <AddressEditor />
      </RenderChildrenWhenDataIsComplete>
    );
  };

  // test only node at index 0;
  const testIndex = 0;

  const validAddressValues: AddressValue = {
    address: 'test-address',
    city: 'test-city',
    postalCode: '99999',
    countryCode: 'DE',
  };

  const invalidAddressValues: AddressValue = {
    address: '',
    city: '',
    postalCode: '',
    countryCode: '',
  };

  const newAddressValues: AddressValue = {
    address: 'test-address-2',
    city: 'my-city',
    postalCode: '00001',
    countryCode: 'SV',
  };

  const fields = Object.keys(validAddressValues) as AddressValueKey[];
  const t = i18n.getFixedT('fi');
  const countryList = countries.getNames(i18n.language);

  const getProfileWithoutAddresses = () =>
    getProfileDataWithoutSomeNodes({
      noNodes: true,
      dataType,
    });

  const getProfileWithAddress = (address: AddressValue) =>
    cloneProfileAndProvideManipulationFunctions(getProfileWithoutAddresses())
      .add(dataType, { ...address, id: '666', primary: true })
      .getProfile();

  beforeEach(() => {
    responses.length = 0;
  });
  afterEach(() => {
    cleanComponentMocks();
  });

  const getFieldValueSelector = (
    field: AddressValueKey,
    targetIsInput = false,
    index = 0
  ): ElementSelector => {
    if (field === 'countryCode' && targetIsInput) {
      return {
        id: `${dataType}-${index}-${field}-input`,
      };
    }
    return targetIsInput
      ? {
          id: `${dataType}-${index}-${field}`,
        }
      : { testId: `${dataType}-${index}-${field}-value` };
  };

  const convertFieldValue = (
    source: DataSource,
    field: AddressValueKey
  ): string => {
    const value = source[field];
    if (field !== 'countryCode') {
      return value || '';
    }
    if (!value) {
      return '';
    }
    return countryList[value] || '';
  };

  const verifyValuesFromElements = async (
    testTools: TestTools,
    source: DataSource,
    targetIsInput = false,
    index = 0
  ) => {
    const { getTextOrInputValue } = testTools;
    for (const field of fields) {
      const expectedValue = convertFieldValue(source, field);
      await expect(
        getTextOrInputValue(getFieldValueSelector(field, targetIsInput, index))
      ).resolves.toBe(expectedValue);
    }
  };

  const setValuesToInputs = async (
    testTools: TestTools,
    source: DataSource
  ) => {
    const { setInputValue, comboBoxSelector, getTextOrInputValue } = testTools;
    for (const field of fields) {
      const newValue = convertFieldValue(source, field);
      if (field === 'countryCode') {
        // comboBoxSelector will throw an error if attempting to set a value which is already set
        const currentValue = await getTextOrInputValue(
          getFieldValueSelector(field, true)
        );
        if (currentValue !== newValue) {
          await comboBoxSelector(`${dataType}-${testIndex}-${field}`, newValue);
        }
      } else {
        await setInputValue({
          selector: getFieldValueSelector(field, true),
          newValue,
        });
      }
    }
  };

  const verifyTitleAndDescription = (
    testTools: TestTools,
    scenario:
      | 'verifiedUserWithoutAddress'
      | 'verifiedUserWithAddress'
      | 'unverifiedUserWithNoAddress'
      | 'unverifiedUserWithOneAddress'
  ) => {
    const noAddressText = 'profileInformation.addressDescriptionNoAddress';
    const unverifiedUserTitle = 'profileInformation.address';
    const verifiedUserTitle =
      'profileInformation.addressTitleWhenHasVerifiedData';

    const verifyZeroTextInstanceExists = (translationKey: string) => {
      if (testTools.queryByText(String(t(translationKey)))) {
        throw new Error(`Expected to find zero ${translationKey} texts`);
      }
    };

    const verifyOneTextInstanceExists = (translationKey: string) => {
      // getByText will throw if resulting element count is not 1
      testTools.getByText(String(t(translationKey)));
    };

    if (scenario === 'verifiedUserWithoutAddress') {
      verifyOneTextInstanceExists(verifiedUserTitle);
      verifyOneTextInstanceExists(
        'profileInformation.addressDescriptionNoWeakAddress'
      );
    } else if (scenario === 'verifiedUserWithAddress') {
      verifyOneTextInstanceExists(verifiedUserTitle);
      verifyOneTextInstanceExists('profileInformation.addressDescription');
    } else if (scenario === 'unverifiedUserWithNoAddress') {
      verifyOneTextInstanceExists(unverifiedUserTitle);
      verifyOneTextInstanceExists(noAddressText);
    } else if (scenario === 'unverifiedUserWithOneAddress') {
      verifyOneTextInstanceExists(unverifiedUserTitle);
      verifyZeroTextInstanceExists(noAddressText);
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

  const initTestsWithVerifiedUser = async (
    profileData: ProfileData = initialProfile
  ): Promise<TestTools> =>
    initTests({
      ...profileData,
      verifiedPersonalInformation: getVerifiedData(),
    });

  const initialAddressInProfile = getAddressesFromNode(
    { myProfile: initialProfile },
    true
  )[0];

  const addressNodes = getAddressesFromNode(
    { myProfile: initialProfile },
    true
  );

  const usedAddressNode = addressNodes[0];

  it("renders all user's addresses - also in edit mode. Add button is not shown.", async () => {
    await act(async () => {
      const testTools = await initTests();
      const { clickElement, getElement } = testTools;
      expect(addressNodes).toHaveLength(2);
      await verifyValuesFromElements(testTools, usedAddressNode, false, 0);
      // goto edit mode
      await clickElement(getCommonElementSelector(dataType, 'editButton', 0));
      await verifyValuesFromElements(testTools, usedAddressNode, true, 0);
      expect(() =>
        getElement(getCommonElementSelector(dataType, 'addButton'))
      ).toThrow();
      verifyTitleAndDescription(testTools, 'unverifiedUserWithOneAddress');
    });
  });

  it(`sends updated data and returns to view mode when saved. 
      Shows save notifications. 
      Focus is returned to edit button`, async () => {
    await act(async () => {
      const testTools = await initTests();
      const { clickElement, submit, getElement } = testTools;
      await clickElement(getCommonElementSelector(dataType, 'editButton'));
      await setValuesToInputs(testTools, newAddressValues);

      // create graphQL response for the update
      const updatedProfileData = cloneProfileAndProvideManipulationFunctions(
        initialProfile
      )
        .edit(dataType, { ...initialAddressInProfile, ...newAddressValues })
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
        selector: getCommonElementSelector(dataType, 'editNotifications'),
        value: t('notification.saveSuccess'),
      };
      // submit and wait for "saving" and 'saveSuccess' notifications
      await submit({
        waitForOnSaveNotification,
        waitForAfterSaveNotification,
      });
      // verify new values are visible
      await verifyValuesFromElements(testTools, newAddressValues);
      // focus is set to edit button
      await waitForElementFocus(() =>
        getElement(getCommonElementSelector(dataType, 'editButton'))
      );
    });
  });

  it('on send error shows error notification and stays in edit mode. Cancel-button resets data', async () => {
    await act(async () => {
      const testTools = await initTests();
      const { clickElement, submit } = testTools;
      await clickElement(getCommonElementSelector(dataType, 'editButton'));
      await setValuesToInputs(testTools, newAddressValues);

      // add the graphQL response
      responses.push({
        errorType: 'networkError',
      });

      const waitForAfterSaveNotification: WaitForElementAndValueProps = {
        selector: getCommonElementSelector(dataType, 'editNotifications'),
        value: t('notification.saveError'),
      };

      // submit and wait for saving and error notifications
      await submit({
        waitForAfterSaveNotification,
        skipDataCheck: true,
      });

      // input fields are still rendered
      await verifyValuesFromElements(testTools, newAddressValues, true);
      // cancel edits
      await clickElement({
        testId: `${dataType}-${testIndex}-cancel-button`,
      });
      // values are reset to previous values
      await verifyValuesFromElements(testTools, initialAddressInProfile);
    });
  });
  fields.forEach(async field => {
    it(`invalid value for ${field} is indicated and setting a valid value removes the error`, async () => {
      const testTools = await initTests();
      const {
        clickElement,
        setInputValue,
        getElement,
        comboBoxSelector,
      } = testTools;
      await act(async () => {
        const fieldValueSelector = getFieldValueSelector(field, true);
        await clickElement(getCommonElementSelector(dataType, 'editButton'));
        const elementGetter = () => getElement(fieldValueSelector);
        const errorElementGetter = () =>
          getElement({ id: `${dataType}-${testIndex}-${field}-error` });
        const errorListElementGetter = () =>
          getElement({ testId: `${dataType}-error-list` });

        const invalidValues = {
          ...validAddressValues,
          ...{ [field]: invalidAddressValues[field] },
        };
        // set invalid values
        if (field === 'countryCode') {
          await comboBoxSelector(
            `addresses-${testIndex}-countryCode`,
            invalidValues.countryCode
              ? countryList[invalidValues.countryCode]
              : ''
          );
        } else {
          await setInputValue({
            selector: getFieldValueSelector(field, true),
            newValue: invalidValues[field],
          });
        }
        // submit also validates the form
        await clickElement(submitButtonSelector);
        await waitForElementAttributeValue(elementGetter, 'aria-invalid', true);
        // error element and list are found
        expect(errorElementGetter).not.toThrow();
        expect(errorListElementGetter).not.toThrow();
        // set valid value
        if (field === 'countryCode') {
          await comboBoxSelector(
            `addresses-${testIndex}-countryCode`,
            countryList[validAddressValues.countryCode]
          );
        } else {
          await setInputValue({
            selector: getFieldValueSelector(field, true),
            newValue: validAddressValues[field],
          });
        }
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
  it(`When there is no address, the add button is rendered and an address can be added. 
      Add button is not shown after it has been clicked and address is saved.`, async () => {
    await act(async () => {
      const profileWithoutAddresses = getProfileWithoutAddresses();
      const testTools = await initTests(profileWithoutAddresses);
      const {
        clickElement,
        getElement,
        submit,
        getTextOrInputValue,
      } = testTools;

      verifyTitleAndDescription(testTools, 'unverifiedUserWithNoAddress');
      // edit button is not rendered
      expect(() =>
        getElement(getCommonElementSelector(dataType, 'editButton'))
      ).toThrow();

      // info text is shown instead of an address
      await expect(
        getTextOrInputValue(getCommonElementSelector(dataType, 'noDataText'))
      ).resolves.toBe(t('profileInformation.addressDescriptionNoAddress'));
      // click add button to create an address
      await clickElement(getCommonElementSelector(dataType, 'addButton'));
      expect(() =>
        getElement(getCommonElementSelector(dataType, 'addButton'))
      ).toThrow();
      await setValuesToInputs(testTools, validAddressValues);

      // create the graphQL response
      const profileWithAddress = getProfileWithAddress(validAddressValues);

      // add the graphQL response
      responses.push({ updatedProfileData: profileWithAddress });

      const waitForAfterSaveNotification: WaitForElementAndValueProps = {
        selector: getCommonElementSelector(dataType, 'editNotifications'),
        value: t('notification.saveSuccess'),
      };

      await submit({
        skipDataCheck: true,
        waitForAfterSaveNotification,
      });

      await verifyValuesFromElements(testTools, validAddressValues);
      expect(() =>
        getElement(getCommonElementSelector(dataType, 'addButton'))
      ).toThrow();
      verifyTitleAndDescription(testTools, 'unverifiedUserWithOneAddress');
    });
  });
  it(`When removing an address, a confirmation modal is shown. 
      Remove error is handled and shown.
      When removal is complete, add button is shown and a text about no addresses.`, async () => {
    await act(async () => {
      const profileWithoutAddresses = getProfileWithoutAddresses();
      const profileWithAddress = getProfileWithAddress(validAddressValues);

      const {
        clickElement,
        getElement,
        waitForElementAndValue,
        waitForElement,
      } = await initTests(profileWithAddress);

      // add error response
      responses.push({
        errorType: 'networkError',
      });
      // add the graphQL response
      responses.push({
        updatedProfileData: profileWithoutAddresses,
      });

      expect(() =>
        getElement(getCommonElementSelector(dataType, 'addButton'))
      ).toThrow();
      // click remove button, confirm removal and handle error
      await clickElement(getCommonElementSelector(dataType, 'removeButton'));
      await waitForElement(
        getCommonElementSelector(dataType, 'confirmRemovalButton')
      );
      await clickElement(
        getCommonElementSelector(dataType, 'confirmRemovalButton')
      );

      await waitForElementAndValue({
        selector: getCommonElementSelector(dataType, 'editNotifications'),
        value: t('notification.removeError'),
      });

      // start removal again
      await clickElement(getCommonElementSelector(dataType, 'removeButton'));
      await waitForElement(
        getCommonElementSelector(dataType, 'confirmRemovalButton')
      );
      await clickElement(
        getCommonElementSelector(dataType, 'confirmRemovalButton')
      );

      await waitForElementAndValue({
        selector: getCommonElementSelector(dataType, 'editNotifications'),
        value: t('notification.removeSuccess'),
      });
      // item is removed and also remove button
      expect(() =>
        getElement(getCommonElementSelector(dataType, 'removeButton'))
      ).toThrow();
      expect(() =>
        getElement(getCommonElementSelector(dataType, 'addButton'))
      ).not.toThrow();
      expect(() =>
        getElement(getCommonElementSelector(dataType, 'noDataText'))
      ).not.toThrow();
    });
  });
  it(`When a new address is cancelled, nothing is saved and
      add button is shown and a text about no addresses.
      Focus is returned to add button`, async () => {
    await act(async () => {
      const testTools = await initTests(getProfileWithoutAddresses());
      await testAddWithCancel(
        dataType,
        getFieldValueSelector('address', true),
        testTools
      );
    });
  });
  it('When user is logged in with suomi.fi, there is one additional description and different title.', async () => {
    await act(async () => {
      const profileWithoutAddresses = getProfileWithoutAddresses();
      const testTools = await initTestsWithVerifiedUser(
        profileWithoutAddresses
      );
      const { clickElement } = testTools;
      verifyTitleAndDescription(testTools, 'verifiedUserWithoutAddress');
      await clickElement(getCommonElementSelector(dataType, 'addButton'));
      // same title + text in edit mode
      verifyTitleAndDescription(testTools, 'verifiedUserWithoutAddress');
    });
  });
  it('If verified user has an addresses, title and description are different than without addresses.', async () => {
    await act(async () => {
      const profileWithAddress = getProfileWithAddress(validAddressValues);
      const testTools = await initTestsWithVerifiedUser(profileWithAddress);
      verifyTitleAndDescription(testTools, 'verifiedUserWithAddress');
    });
  });
});
