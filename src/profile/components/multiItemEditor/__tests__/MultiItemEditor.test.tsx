import React from 'react';
import { act, waitFor } from '@testing-library/react';

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
  waitForElementFocus,
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
import {
  getCountryCallingCodes,
  splitNumberAndCountryCallingCode,
} from '../../../../i18n/countryCallingCodes.utils';

type MultiItemDataTypes = Extract<EditDataType, 'addresses' | 'phones'>;

describe('<MultiItemEditor /> ', () => {
  const responses: MockedResponse[] = [];
  const initialProfile = getMyProfile().myProfile as ProfileData;
  const renderTestSuite = (dataType: MultiItemDataTypes) => {
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
  // data may be FormValues or PhoneNode or AddressNode
  // GeneralData type prevents casting all the time.
  // Data used in tests is anyway in <string, string> format
  type GeneralData = Record<string, string>;
  type TestData = {
    [x: string]: {
      fields: string[];
      formValues: GeneralData;
      newValues: GeneralData;
      invalidValues: GeneralData;
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
      newValues: {
        address: 'test-address-2',
        city: 'my-city',
        postalCode: '00001',
      },
      invalidValues: {
        address: '',
        city: '',
        postalCode: '',
      },
    },
    phones: {
      fields: ['number', 'countryCallingCode'],
      formValues: {
        phone: '+358123456789',
      },
      newValues: {
        phone: '+4406123456789',
      },
      invalidValues: {
        phone: '',
      },
    },
  };

  beforeEach(() => {
    responses.length = 0;
  });
  afterEach(() => {
    cleanComponentMocks();
  });

  const initTests = async (
    dataType: MultiItemDataTypes
  ): Promise<TestTools> => {
    responses.push({ profileData: initialProfile });
    const testTools = await renderTestSuite(dataType);
    await testTools.fetch();
    return Promise.resolve(testTools);
  };

  const multiItemDataTypes: MultiItemDataTypes[] = ['phones', 'addresses'];
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

    const { fields, formValues, newValues, invalidValues } = testData[dataType];
    const sourceNodeList = pickSources(
      initialProfile,
      dataType
    ) as MultiItemProfileNode[];
    const sourceNode = (sourceNodeList[testIndex] as unknown) as GeneralData;

    const isCountryCallingCodeField = (fieldName: string): boolean =>
      fieldName === 'countryCallingCode';

    // countryCallingCode field is not present when not in edit mode
    const isFieldVerifiyable = (
      targetIsInput: boolean,
      fieldName: string
    ): boolean =>
      !(
        dataType === 'phones' &&
        !targetIsInput &&
        isCountryCallingCodeField(fieldName)
      );

    const convertFieldValue = (
      targetIsInput: boolean,
      fieldName: string,
      source: GeneralData
    ): string => {
      if (dataType !== 'phones') {
        return source[fieldName];
      }
      // When dataType is "phones", the fieldName is "phones" in graphQL
      // That is why "number" is not used in source
      const value = source['phone'];
      if (!targetIsInput) {
        return value;
      }
      const { countryCallingCode, number } = splitNumberAndCountryCallingCode(
        value
      );
      if (fieldName === 'number') {
        return number;
      }
      // default is "+358" so prevent that when no value is wanted
      if (!value) {
        return '';
      }
      const countryCallingCodeOptions = getCountryCallingCodes('fi').filter(
        option => option.value === countryCallingCode
      );
      return countryCallingCodeOptions && countryCallingCodeOptions.length
        ? countryCallingCodeOptions[0].label
        : '';
    };

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
          ? {
              id: `${dataType}-${index}-${name}${
                isCountryCallingCodeField(name) ? `-input` : ''
              }`,
            }
          : { testId: `${dataType}-${index}-value` };
      };
      // cannot use forEach with async/await
      for (const field of fields) {
        if (!isFieldVerifiyable(targetIsInput, field)) {
          break;
        }
        const selector = getSelector(field);
        const value = convertFieldValue(targetIsInput, field, source);
        await expect(getTextOrInputValue(selector)).resolves.toBe(value);
      }
    };

    // sets new data to input fields
    const setValues = async (
      setInputValue: TestTools['setInputValue'],
      source: GeneralData,
      index: number,
      comboBoxSelector: TestTools['comboBoxSelector']
    ) => {
      // cannot use forEach with async/await
      for (const field of fields) {
        const value = convertFieldValue(true, field, source);
        if (isCountryCallingCodeField(field)) {
          await comboBoxSelector(
            `${dataType}-${index}-countryCallingCode`,
            value
          );
        } else {
          await setInputValue({
            selector: {
              id: `${dataType}-${index}-${field}`,
            },
            newValue: value,
          });
        }
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
            ...newValues,
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
            comboBoxSelector,
          } = await initTests(dataType);
          await clickElement(editButtonSelector);
          await waitForElement(cancelButtonSelector);
          await setValues(setInputValue, newValues, 0, comboBoxSelector);
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
          await verifyValues(getTextOrInputValue, newValues, testIndex);
        });
      });

      it('Clicking "add new" creates new item and Add button is disabled until new item is saved', async () => {
        // create graphQL response for the update
        const updatedProfileData = cloneProfileAndProvideManipulationFunctions(
          initialProfile
        )
          .add(dataType, {
            ...newValues,
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
            getElement,
            comboBoxSelector,
          } = await initTests(dataType);
          await clickElement(addButtonSelector);
          await waitFor(() => {
            expect(isDisabled(getElement(addButtonSelector))).toBeTruthy();
          });
          await setValues(
            setInputValue,
            newValues,
            newItemIndex,
            comboBoxSelector
          );
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
            expect(isDisabled(getElement(addButtonSelector))).toBeFalsy();
          });
          await verifyValues(getTextOrInputValue, newValues, newItemIndex);
          // focus is set to add button
          await waitForElementFocus(() => getElement(addButtonSelector));
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
            getElement,
            comboBoxSelector,
          } = await initTests(dataType);
          await clickElement(editButtonSelector);
          await waitForElement(cancelButtonSelector);
          await setValues(
            setInputValue,
            newValues,
            testIndex,
            comboBoxSelector
          );
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
          await verifyValues(getTextOrInputValue, newValues, testIndex, true);
          await clickElement(cancelButtonSelector);
          // values are reset to previous values
          await verifyValues(getTextOrInputValue, sourceNode, testIndex);
          // focus is set to edit button
          await waitForElementFocus(() => getElement(editButtonSelector));
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
          const primaryItemRemoveButtonSelector: ElementSelector = {
            id: `${dataType}-0-remove-button`,
          };
          const removeButtonSelector: ElementSelector = {
            id: `${dataType}-${removeItemIndex}-remove-button`,
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
    it(`Clicking set as primary -button moves the item as #0 and old one is not primary anymore`, async () => {
      const newPrimaryIndex = 1;
      const newPrimaryNode = sourceNodeList[newPrimaryIndex];
      const oldPrimaryNode = sourceNodeList[0];
      // create graphQL response for the update
      const updatedProfileData = cloneProfileAndProvideManipulationFunctions(
        initialProfile
      )
        .edit(dataType, {
          primary: true,
          id: newPrimaryNode.id,
        })
        .edit(dataType, {
          primary: false,
          id: oldPrimaryNode.id,
        })
        .setPrimary(dataType, newPrimaryNode)
        .getProfile();

      await act(async () => {
        const {
          clickElement,
          getElement,
          waitForElementAndValue,
        } = await initTests(dataType);
        // add error response
        responses.push({
          errorType: 'graphQLError',
        });
        // add the graphQL response
        responses.push({
          updatedProfileData,
        });
        const primaryItemPrimaryIndicator: ElementSelector = {
          testId: `${dataType}-0-primary-indicator`,
        };
        const setPrimaryButtonSelector: ElementSelector = {
          testId: `${dataType}-${newPrimaryIndex}-set-primary-button`,
        };
        const nonExistingSetPrimaryButtonSelector: ElementSelector = {
          testId: `${dataType}-0-set-primary-button`,
        };

        // primary item should have primary indicator
        expect(() => getElement(primaryItemPrimaryIndicator)).not.toThrow();
        // primary item should not have set as primary button
        expect(() => getElement(nonExistingSetPrimaryButtonSelector)).toThrow();
        // click set as primary -button and handle error
        await clickElement(setPrimaryButtonSelector);
        // save indicator is rendered. Note: new primary item is moved as child #0
        await waitForElementAndValue({
          selector: {
            testId: `${dataType}-0-save-indicator`,
          },
          value: t('notification.saving'),
        });
        // check error message
        await waitForElementAndValue({
          selector: { id: `${dataType}-edit-notifications` },
          value: t('notification.genericError'),
        });

        // start removal again, now with success
        await clickElement(setPrimaryButtonSelector);
        await waitForElementAndValue({
          selector: { id: `${dataType}-edit-notifications` },
          value: t('notification.genericSuccess'),
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
              comboBoxSelector,
            } = await initTests(dataType);
            await clickElement(editButtonSelector);
            await waitForElement(cancelButtonSelector);
            const selector = `${dataType}-${testIndex}-${field}`.replace(
              'countryCallingCode',
              'countryCallingCode-input'
            );

            const testRun = {
              validData: formValues,
              invalidData: { ...formValues, ...invalidValues },
              elementSelector: { id: `${selector}` },
              errorSelector: {
                id: `${dataType}-${testIndex}-${field}-error`,
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
            const errorListElementGetter = () =>
              getElement({ testId: `${dataType}-error-list` });

            // set invalid values
            await setValues(
              setInputValue,
              invalidData,
              testIndex,
              comboBoxSelector
            );
            // submit also validates the form
            await clickElement(submitButtonSelector);
            await waitForElementAttributeValue(
              elementGetter,
              'aria-invalid',
              true
            );
            // getElement throws if element is not found
            expect(errorElementGetter).not.toThrow();
            expect(errorListElementGetter).not.toThrow();
            // set valid value
            await setValues(
              setInputValue,
              validData,
              testIndex,
              comboBoxSelector
            );
            await waitForElementAttributeValue(
              elementGetter,
              'aria-invalid',
              false
            );
            await waitFor(() => {
              expect(errorElementGetter).toThrow();
              expect(errorListElementGetter).toThrow();
            });
          });
        });
      });
    });
  });
});
