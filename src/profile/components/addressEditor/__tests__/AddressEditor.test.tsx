import React from 'react';
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
  ElementSelector,
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

describe('<AddressEditor /> ', () => {
  type AddressValueKey = keyof AddressValue;
  type AddressDataSource = Partial<AddressValue | AddressNode>;
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
    source: AddressDataSource,
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
    targetIsInput = false
  ) => {
    const { getTextOrInputValue } = testTools;
    for (const field of fields) {
      const expectedValue = convertFieldValue(
        source as AddressDataSource,
        field
      );
      await expect(
        getTextOrInputValue(getFieldValueSelector(field, targetIsInput, 0))
      ).resolves.toBe(expectedValue);
    }
  };

  const setValuesToInputs = async (
    testTools: TestTools,
    source: DataSource
  ) => {
    const { setInputValue, comboBoxSelector, getTextOrInputValue } = testTools;
    for (const field of fields) {
      const newValue = convertFieldValue(source as AddressDataSource, field);
      if (field === 'countryCode') {
        // comboBoxSelector will throw an error if attempting to set a value which is already set
        const currentValue = await getTextOrInputValue(
          getFieldValueSelector(field, true)
        );
        if (currentValue !== newValue) {
          await comboBoxSelector(`${dataType}-0-${field}`, newValue);
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

  const getUpdatedProfile = (newValues: AddressValue, profile?: ProfileData) =>
    cloneProfileAndProvideManipulationFunctions(profile || initialProfile)
      .edit(dataType, { ...initialAddressInProfile, ...newValues })
      .getProfile();

  const commonTestProps: Exclude<CommonTestSuite, 'sentDataPicker'> = {
    selectors: getElementSelectors(dataType),
    valueSetter: setValuesToInputs,
    valueVerifier: verifyValuesFromElements,
    responses,
    notificationMessages: getNotificationMessages(t),
  };

  const profileWithoutAddresses = getProfileWithoutAddresses();
  const profileWithAddress = getProfileWithAddress(validAddressValues);

  it("renders user's addresses - also in edit mode. Add button is not shown when address exists.", async () => {
    const testTools = await initTests();
    const testSuite = {
      testTools,
      formData: usedAddressNode,
      ...commonTestProps,
    };
    await testDataIsRendered(testSuite);
    checkAddButton(testSuite, false);
    verifyTitleAndDescription(testTools, 'unverifiedUserWithOneAddress');
  });

  it('sends new data and returns to view mode when saved', async () => {
    const testTools = await initTests();
    await testEditingItem({
      testTools,
      formData: newAddressValues,
      assumedResponse: getUpdatedProfile(newAddressValues),
      sentDataPicker: variables =>
        (variables.input.profile.updateAddresses as DataSource[])[0],
      ...commonTestProps,
    });
  });

  it('on send error shows error notification and stays in edit mode. Cancel-button resets data', async () => {
    const testTools = await initTests();
    await testEditingItemFailsAndCancelResets({
      testTools,
      formData: newAddressValues,
      initialValues: usedAddressNode,
      ...commonTestProps,
    });
  });

  it('When saving fails twice, the second one does result in save success, because data did not change.', async () => {
    const testTools = await initTests();
    await testDoubleFailing({
      testTools,
      formData: newAddressValues,
      initialValues: usedAddressNode,
      assumedResponse: getUpdatedProfile(newAddressValues),
      ...commonTestProps,
    });
  });
  it('When user saves without making changes, data is not sent, but save success is shown.', async () => {
    const testTools = await initTests();
    await testUnchangedDataIsNotSent({
      testTools,
      formData: usedAddressNode,
      initialValues: usedAddressNode,
      ...commonTestProps,
    });
  });

  it('invalid values are indicated and setting a valid value removes error', async () => {
    const testTools = await initTests();

    const testRuns: ValidationTest[] = fields.map(prop => ({
      prop,
      value: invalidAddressValues[prop],
      inputSelector: getFieldValueSelector(prop, true),
      errorSelector: { id: `${dataType}-0-${prop}-error` },
    }));

    await testInvalidValues(
      {
        testTools,
        formData: usedAddressNode,
        initialValues: initialProfile,
        ...commonTestProps,
      },
      testRuns
    );
  });

  it(`When there is no address, the add button is rendered and an address can be added.
      Add button is not shown after it has been clicked and address is saved.`, async () => {
    const testTools = await initTests(profileWithoutAddresses);
    verifyTitleAndDescription(testTools, 'unverifiedUserWithNoAddress');
    await testAddingItem({
      testTools,
      formData: validAddressValues,
      assumedResponse: profileWithAddress,
      sentDataPicker: variables =>
        ((variables.input.profile.addAddresses as unknown) as DataSource[])[0],
      ...commonTestProps,
    });
    verifyTitleAndDescription(testTools, 'unverifiedUserWithOneAddress');
  });

  it(`When removing an address, a confirmation modal is shown.
      Remove error is handled and shown.
      When removal is complete, add button is shown and a text about no addresses.`, async () => {
    const testTools = await initTests(profileWithAddress);
    await testRemovingItem({
      testTools,
      assumedResponse: profileWithoutAddresses,
      ...commonTestProps,
    });
  });
  it(`When a new address is cancelled, nothing is saved and
      add button is shown and a text about no addresses.
      Focus is returned to add button`, async () => {
    const testTools = await initTests(profileWithoutAddresses);
    await testAddingItemWithCancel(
      {
        testTools,
        formData: validAddressValues,
        ...commonTestProps,
      },
      false
    );
  });
  it('When user is logged in with suomi.fi, there is one additional description and different title.', async () => {
    const testTools = await initTestsWithVerifiedUser(profileWithoutAddresses);
    const { clickElement } = testTools;
    verifyTitleAndDescription(testTools, 'verifiedUserWithoutAddress');
    await clickElement(commonTestProps.selectors.addButton);
    // same title + text in edit mode
    verifyTitleAndDescription(testTools, 'verifiedUserWithoutAddress');
  });
  it('If verified user has an addresses, title and description are different than without addresses.', async () => {
    const testTools = await initTestsWithVerifiedUser(profileWithAddress);
    verifyTitleAndDescription(testTools, 'verifiedUserWithAddress');
  });
});
