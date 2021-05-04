import React from 'react';
import { act, waitFor } from '@testing-library/react';
import Modal from 'react-modal';

import {
  cloneProfileAndProvideManipulationFunctions,
  getMyProfile,
} from '../../../../common/test/myProfileMocking';
import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
  WaitForElementAndValueProps,
  ElementSelector,
  waitForElementAttributeValue,
} from '../../../../common/test/testingLibraryTools';
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
import RenderChildrenWhenDataIsComplete from '../../../../common/test/RenderChildrenWhenDataIsComplete';

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

  const multiItemDataTypes: EditDataType[] = ['emails', 'phones', 'addresses'];
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
      for (const field of fields) {
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
      for (const field of fields) {
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

    describe(`Renders ${dataType} and its fields: ${fields.join(',')}`, () => {
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

      it(`Component shows error notification and stays in edit mode when error occurs. 
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
      it(`Clicking remove-button shows confirm dialog and removes target item (if it is not primary)`, async () => {
        // first item is primary and cannot be removed
        const removeItemIndex = 1;
        const removeNode = sourceNodeList[removeItemIndex];
        // create graphQL response for the removal
        const updatedProfileData = cloneProfileAndProvideManipulationFunctions(
          initialProfile
        )
          .remove(dataType, {
            id: removeNode.id,
          })
          .getProfile();

        await act(async () => {
          const {
            clickElement,
            getElement,
            waitForElement,
            waitForElementAndValue,
          } = await initTests(dataType);
          // add error response
          responses.push({
            errorType: 'networkError',
          });
          // add the graphQL response
          responses.push({
            updatedProfileData,
          });
          Modal.setAppElement('#modal-container');
          const primaryItemRemoveButtonSelector: ElementSelector = {
            testId: `${dataType}-0-remove-button`,
          };
          const removeButtonSelector: ElementSelector = {
            testId: `${dataType}-${removeItemIndex}-remove-button`,
          };
          const confirmButtonSelector = {
            testId: 'confirmation-modal-confirm-button',
          };
          // primary item should not have remove button
          expect(() => getElement(primaryItemRemoveButtonSelector)).toThrow();
          // click remove button, confirm removal and handle error
          await clickElement(removeButtonSelector);
          await waitForElement(confirmButtonSelector);
          await clickElement(confirmButtonSelector);

          await waitForElementAndValue({
            selector: { id: `${dataType}-edit-notifications` },
            value: t('notification.removeError'),
          });

          // start removal again
          await clickElement(removeButtonSelector);
          await waitForElement(confirmButtonSelector);
          await clickElement(confirmButtonSelector);

          await waitForElementAndValue({
            selector: { id: `${dataType}-edit-notifications` },
            value: t('notification.removeSuccess'),
          });
          // item is removed and also remove button
          expect(() => getElement(removeButtonSelector)).toThrow();
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
            // getElement throws if element is not found
            expect(() => errorElementGetter).not.toThrow();
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
