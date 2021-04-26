import React from 'react';
import { act, waitFor } from '@testing-library/react';

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
  waitForElementAttributeValue,
} from '../../../../common/test/componentMocking';
import { ProfileData } from '../../../../graphql/typings';
import MultiItemEditor from '../MultiItemEditor';
import {
  MockedResponse,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import {
  EditDataType,
  MultiItemProfileNode,
  pickSources,
} from '../../../helpers/editData';
import i18n from '../../../../common/test/testi18nInit';

describe('<MultiItemEditor /> ', () => {
  const responses: MockedResponse[] = [];
  const initialProfile = getMyProfile().myProfile as ProfileData;
  const renderTestSuite = (dataType: EditDataType) => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return renderComponentWithMocksAndContexts(
      responseProvider,
      <RenderChildrenWhenDataIsComplete>
        <MultiItemEditor dataType={dataType} />
      </RenderChildrenWhenDataIsComplete>
    );
  };
  const t = i18n.getFixedT('fi');

  // data may be FormValues or EmailNode, PhoneNode, AddressNode
  // GeneralData type prevents casting all the time.
  // Data used in tests is anyway in <string, string> format
  type GeneralData = Record<string, string>;
  type TestData = {
    [x: string]: {
      fields: string[];
      formValues: GeneralData;
    };
  };
  const testData: TestData = {
    addresses: {
      fields: ['address', 'city', 'postalCode'],
      formValues: {
        address: 'test-address',
        city: 'test-city',
        postalCode: '99999',
        countryCode: 'FI',
      },
    },
    phones: {
      fields: ['phone'],
      formValues: {
        phone: '555-555-123',
      },
    },
    emails: {
      fields: ['email'],
      formValues: {
        email: 'test-email@email.com',
      },
    },
  };

  beforeEach(() => {
    responses.length = 0;
  });
  afterEach(() => {
    cleanComponentMocks();
  });

  const initTests = async (dataType: EditDataType): Promise<TestTools> => {
    responses.push({ profileData: initialProfile });
    const testTools = await renderTestSuite(dataType);
    await testTools.fetch();
    return Promise.resolve(testTools);
  };

  const multiItemDataTypes: EditDataType[] = ['emails'];
  multiItemDataTypes.forEach(dataType => {
    // test only node at index 0;
    const testIndex = 0;
    const editButtonSelector: ElementSelector = {
      id: `${dataType}-${testIndex}-edit-button`,
    };
    const submitButtonSelector: ElementSelector = {
      testId: `${dataType}-${testIndex}-save-button`,
    };
    const cancelButtonSelector: ElementSelector = {
      testId: `${dataType}-${testIndex}-cancel-button`,
    };
    const addButtonSelector: ElementSelector = {
      id: `${dataType}-add-button`,
    };

    const { fields, formValues } = testData[dataType];
    const sourceNodeList = pickSources(
      initialProfile,
      dataType
    ) as MultiItemProfileNode[];
    const sourceNode = (sourceNodeList[testIndex] as unknown) as GeneralData;

    // verifies rendered data
    const verifyValues = async (
      getTextOrInputValue: TestTools['getTextOrInputValue'],
      source: GeneralData,
      index: number,
      targetIsInput = false
    ) => {
      const getSelector = (name: string): GeneralData => {
        if (dataType === 'addresses') {
          return targetIsInput
            ? { id: `${dataType}-${index}-${name}` }
            : { testId: `${dataType}-${index}-${name}-value` };
        }
        return targetIsInput
          ? { id: `${dataType}-${index}-value` }
          : { testId: `${dataType}-${index}-value` };
      };
      // cannot use forEach with async/await
      for (let i = 0; i < fields.length; i = i + 1) {
        const field = fields[i];
        const selector = getSelector(field);
        const value = source[field];
        await expect(getTextOrInputValue(selector)).resolves.toBe(value);
      }
    };

    // sets new data to input fields
    const setValues = async (
      setInputValue: TestTools['setInputValue'],
      source: GeneralData,
      index: number
    ) => {
      // cannot use forEach with async/await
      for (let i = 0; i < fields.length; i = i + 1) {
        const field = fields[i];
        const value = source[field];
        await setInputValue({
          selector: {
            id: `${dataType}-${index}-${
              dataType === 'addresses' ? field : 'value'
            }`,
          },
          newValue: value,
        });
      }
    };

    describe(`Renders ${dataType} and fields of that 
      type: ${fields.join(',')}`, () => {
      it(`All fields are rendered in view and in edit mode`, async () => {
        await act(async () => {
          const { getTextOrInputValue, clickElement } = await initTests(
            dataType
          );
          await verifyValues(getTextOrInputValue, sourceNode, testIndex);
          // goto edit mode
          await clickElement(editButtonSelector);
          await verifyValues(getTextOrInputValue, sourceNode, testIndex, true);
        });
      });

      it('Component sends new data and returns to view mode when saved', async () => {
        // create graphQL response for the update
        const updatedProfileData = cloneProfileAndProvideManipulationFunctions(
          initialProfile
        )
          .edit(dataType, {
            ...formValues,
            id: sourceNode.id,
          })
          .getProfile();

        await act(async () => {
          const {
            clickElement,
            setInputValue,
            submit,
            getTextOrInputValue,
            waitForElement,
          } = await initTests(dataType);
          await clickElement(editButtonSelector);
          await waitForElement(cancelButtonSelector);
          await setValues(setInputValue, formValues, 0);
          // add the graphQL response
          responses.push({
            updatedProfileData,
          });

          // when submitting, find these 2 notifications
          const waitForOnSaveNotification: WaitForElementAndValueProps = {
            selector: {
              testId: `${dataType}-${testIndex}-save-indicator`,
            },
            value: t('notification.saving'),
          };
          const waitForAfterSaveNotification: WaitForElementAndValueProps = {
            selector: { id: `${dataType}-edit-notifications` },
            value: t('notification.saveSuccess'),
          };
          // submit and wait for saving and success notifications
          await submit({
            waitForOnSaveNotification,
            waitForAfterSaveNotification,
            optionalSubmitButtonSelector: submitButtonSelector,
          });
          await verifyValues(getTextOrInputValue, formValues, testIndex);
        });
      });

      it('Clicking "add new" creates new item and Add button is disabled until new item is saved', async () => {
        // create graphQL response for the update
        const updatedProfileData = cloneProfileAndProvideManipulationFunctions(
          initialProfile
        )
          .add(dataType, {
            ...formValues,
            id: '999',
          })
          .getProfile();

        const newItemIndex =
          pickSources(updatedProfileData, dataType).length - 1;
        await act(async () => {
          const {
            clickElement,
            setInputValue,
            submit,
            getTextOrInputValue,
            isDisabled,
          } = await initTests(dataType);
          const addButton = await clickElement(addButtonSelector);
          await waitFor(() => {
            expect(isDisabled(addButton)).toBeTruthy();
          });
          await setValues(setInputValue, formValues, newItemIndex);
          // add the graphQL response
          responses.push({
            updatedProfileData,
          });
          await submit({
            optionalSubmitButtonSelector: {
              testId: `${dataType}-${newItemIndex}-save-button`,
            },
          });
          await waitFor(() => {
            expect(isDisabled(addButton)).toBeFalsy();
          });
          await verifyValues(getTextOrInputValue, formValues, newItemIndex);
        });
      });

      it(`Component shows error notification and stays in edit mode when error occures. 
      Cancel-button resets data`, async () => {
        await act(async () => {
          const {
            clickElement,
            setInputValue,
            submit,
            getTextOrInputValue,
            waitForElement,
          } = await initTests(dataType);
          await clickElement(editButtonSelector);
          await waitForElement(cancelButtonSelector);
          await setValues(setInputValue, formValues, testIndex);
          // add the graphQL response
          responses.push({
            errorType: 'networkError',
          });

          const waitForAfterSaveNotification: WaitForElementAndValueProps = {
            selector: { id: `${dataType}-edit-notifications` },
            value: t('notification.saveError'),
          };
          // submit and wait for saving and error notifications
          await submit({
            waitForAfterSaveNotification,
            skipDataCheck: true,
            optionalSubmitButtonSelector: submitButtonSelector,
          });
          // input fields are still rendered
          await verifyValues(getTextOrInputValue, formValues, testIndex, true);
          await clickElement(cancelButtonSelector);
          // values are reset to previous values
          await verifyValues(getTextOrInputValue, sourceNode, testIndex);
        });
      });
    });

    fields.forEach(field => {
      describe(`Component indicates invalid values for ${dataType} and setting a valid value removes error `, () => {
        it(`when field is ${field}`, async () => {
          await act(async () => {
            const {
              clickElement,
              setInputValue,
              getElement,
              waitForElement,
            } = await initTests(dataType);
            await clickElement(editButtonSelector);
            await waitForElement(cancelButtonSelector);
            const selector = `${dataType}-${testIndex}-${
              dataType === 'addresses' ? field : 'value'
            }`;

            const testRun = {
              validData: formValues,
              invalidData: { ...formValues, [field]: '' },
              elementSelector: { id: `${selector}` },
              errorSelector: {
                id: `${selector}-helper`,
              },
            };

            const {
              validData,
              invalidData,
              elementSelector,
              errorSelector,
            } = testRun;
            const elementGetter = () => getElement(elementSelector);
            const errorElementGetter = () => getElement(errorSelector);

            // set invalid values
            await setValues(setInputValue, invalidData, testIndex);
            // submit also validates the form
            await clickElement(submitButtonSelector);
            await waitForElementAttributeValue(
              elementGetter,
              'aria-invalid',
              'true'
            );
            // getElement throws is element is not found
            // so element is not checked in expect
            errorElementGetter();
            // set valid value
            await setValues(setInputValue, validData, testIndex);
            await waitForElementAttributeValue(
              elementGetter,
              'aria-invalid',
              'false'
            );
            expect(errorElementGetter).toThrow();
          });
        });
      });
    });
  });
});
