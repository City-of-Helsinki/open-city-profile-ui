import React, { useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { Formik, FormikProps, Form } from 'formik';
import { waitFor } from '@testing-library/react';
import to from 'await-to-js';
import { Mock } from 'vitest';
import { Option } from 'hds-react';

import FormikDropdown from '../FormikDropdown';
import i18nModule from '../../../i18n/i18nInit';
import { getDefaultCountryCallingCode, getMemoizedCountryCallingCodes } from '../../../i18n/countryCallingCodes.utils';
import getLanguageCode from '../../helpers/getLanguageCode';
import { renderComponentWithMocksAndContexts, TestTools } from '../../test/testingLibraryTools';
import { MockedResponse } from '../../test/MockApolloClientProvider';
import countryCallingCodes from '../../../i18n/countryCallingCodes.json';

type RenderProps = {
  defaultValue: string;
  initialValue?: string;
  currentValue?: string;
  allowSearch?: boolean;
  toggleButtonAriaLabel?: string;
};

describe('<FormikDropdown /> ', () => {
  const formikId = 'formik-dropdown';
  const onChangeListener = vi.fn();
  const onSubmitListener = vi.fn();
  let injectNewCurrentOption: (newCurrentOption: Option) => void;
  let optionsInComponent: Option[];
  const svLanguageCode = 'sv';
  const fiLanguageCode = 'fi';

  const selectors = {
    toggleButton: {
      id: `${formikId}-main-button`,
    },
    input: { id: `${formikId}-input-element` },
    submitButton: { id: `submit-button` },
    languageSwitchers: {
      fi: {
        id: `change-language-${fiLanguageCode}`,
      },
      sv: {
        id: `change-language-${svLanguageCode}`,
      },
    },
    currentLanguage: {
      id: `current-language`,
    },
  };

  const findOptionByValue = (options: Option[], value: string) =>
    options.find((option) => option.value === value) as Option;

  const renderAndReturnTestTools = async (testScenarioProps: RenderProps): Promise<TestTools> => {
    const FormikWrapper = (formikWrapperProps: RenderProps): React.ReactElement => {
      const { defaultValue, initialValue, currentValue, allowSearch } = formikWrapperProps;
      const { i18n } = useTranslation();
      const options = getMemoizedCountryCallingCodes(getLanguageCode(i18n.language)) as Option[];
      optionsInComponent = options;
      const defaultOption = findOptionByValue(options, defaultValue);
      const initialOption = initialValue ? findOptionByValue(options, initialValue) : undefined;
      const currentOptionFromValue = currentValue ? findOptionByValue(options, currentValue) : undefined;
      const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
      };
      const [currentOption, reRender] = useState<Option | undefined>(currentOptionFromValue);
      injectNewCurrentOption = (newCurrentOption) => {
        reRender(newCurrentOption);
      };
      return (
        <div>
          <Formik
            initialValues={{
              value: currentOption?.value || initialOption?.value || defaultOption.value,
            }}
            onSubmit={async (values) => {
              onSubmitListener(values);
            }}
          >
            {(formikProps: FormikProps<{ value: string }>) => (
              <Form>
                <FormikDropdown
                  defaultOption={defaultOption}
                  initialOption={initialOption}
                  currentOption={currentOption}
                  options={options}
                  id={formikId}
                  name={'value'}
                  label={'label'}
                  allowSearch={allowSearch !== false}
                  virtualized
                  onChange={(option: Option) => {
                    const value = option ? option.value : '';
                    formikProps.setFieldValue('value', value);
                    onChangeListener(value);
                  }}
                />
                <button type='submit' id={selectors.submitButton.id}>
                  Submit
                </button>
              </Form>
            )}
          </Formik>
          <button id={selectors.languageSwitchers.fi.id} onClick={() => changeLanguage(fiLanguageCode)} />
          <button id={selectors.languageSwitchers.sv.id} onClick={() => changeLanguage(svLanguageCode)} />
          <span id={selectors.currentLanguage.id}>{i18n.language}</span>
        </div>
      );
    };

    return renderComponentWithMocksAndContexts(
      () => ({}) as MockedResponse,
      <I18nextProvider i18n={i18nModule}>
        <FormikWrapper {...testScenarioProps} />
      </I18nextProvider>,
    );
  };

  const checkInputValue = async (getElement: TestTools['getElement'], expectedValue: string, expectedLabel?: string) =>
    waitFor(async () => {
      const button = getElement(selectors.toggleButton) as HTMLElement;
      const spanElement = button.querySelector('div[aria-hidden="true"] > span') as HTMLElement;
      const buttonText = spanElement.innerHTML;

      const testValue = expectedLabel || findOptionByValue(optionsInComponent, expectedValue).label;
      expect(buttonText).toBe(testValue);
    });

  const checkToggleButtonText = async (getElement: TestTools['getElement'], expectedText: string) =>
    waitFor(async () => {
      const button = getElement(selectors.toggleButton) as HTMLElement;
      const spanElement = button.querySelector('div[aria-hidden="true"] > span') as HTMLElement;
      expect(spanElement.innerHTML).toBe(expectedText);
    });

  const getLastMockCallArgs = (func: Mock) => func.mock.calls[func.mock.calls.length - 1];

  const submitFormAndReturnData = async (testTools: TestTools, expectedValue?: string): Promise<{ value: string }> => {
    const { clickElement } = testTools;
    await clickElement(selectors.submitButton);

    await waitFor(() => {
      if (!getLastMockCallArgs(onSubmitListener)) {
        throw new Error('Not submitted yet');
      }

      // If an expected value is provided, also check that the submitted value matches it
      if (expectedValue) {
        const submittedValue = getLastMockCallArgs(onSubmitListener)[0].value;
        if (submittedValue !== expectedValue) {
          throw new Error(`Expected submitted value to be ${expectedValue} but got ${submittedValue}`);
        }
      }
    });

    return getLastMockCallArgs(onSubmitListener)[0];
  };

  beforeEach(() => {
    optionsInComponent = [];
    vi.resetAllMocks();
  });

  describe('throws an error when ', () => {
    // suppress errors in console
    beforeAll(() => {
      vi.spyOn(console, 'error').mockImplementation(() => vi.fn());
    });
    afterAll(() => {
      vi.restoreAllMocks();
    });

    it('allowSearch is enabled, but toggleButtonAriaLabel is not set', async () => {
      const [err] = await to(
        renderAndReturnTestTools({
          defaultValue: 'thisDoesNotMatter',
          allowSearch: true,
          toggleButtonAriaLabel: '',
        }),
      );
      expect(err).toBeDefined();
    });

    it('allowSearch is enabled with currentOption', async () => {
      const [err] = await to(
        renderAndReturnTestTools({
          defaultValue: 'thisDoesNotMatter',
          currentValue: 'thisDoesNotMatter',
          allowSearch: true,
        }),
      );
      expect(err).toBeDefined();
    });
  });

  describe('renders Combobox where ', () => {
    const defaultTestValue = getDefaultCountryCallingCode();
    const initialTestValue = countryCallingCodes['GB'][0];
    const currentTestValue = countryCallingCodes['CK'][0];

    const renderAndVerifyInputAndFormValue = async (
      testScenarioProps: RenderProps,
      expectedValue: string,
    ): Promise<TestTools> => {
      const testTools = await renderAndReturnTestTools(testScenarioProps);
      const { getElement } = testTools;
      if (testScenarioProps.currentValue) {
        const buttonText = findOptionByValue(optionsInComponent, currentTestValue);
        await checkToggleButtonText(getElement, buttonText.label);
      } else {
        await checkInputValue(getElement, expectedValue);
      }
      const values = await submitFormAndReturnData(testTools);
      expect(values).toEqual({ value: expectedValue });
      return testTools;
    };

    it(`input value equals the label of the default option when
        initial or current options are not set`, async () => {
      await renderAndVerifyInputAndFormValue({ defaultValue: defaultTestValue }, defaultTestValue);
    });

    it(`input value equals the label of the initial option when
        default option exists, but current does not`, async () => {
      await renderAndVerifyInputAndFormValue(
        { defaultValue: defaultTestValue, initialValue: initialTestValue },
        initialTestValue,
      );
    });

    it(`When allowSearch is false, input field does not exist.
        Button text equals label of the current option. Even when default and initial options exist.
        "allowSearch" must be false when current option is used`, async () => {
      const { getElement } = await renderAndVerifyInputAndFormValue(
        {
          defaultValue: defaultTestValue,
          initialValue: initialTestValue,
          currentValue: currentTestValue,
          allowSearch: false,
        },
        currentTestValue,
      );

      expect(() => getElement(selectors.input)).toThrow();
    });
  });

  describe('reacts to UI changes', () => {
    const changeLanguage = async (
      testTools: TestTools,
      targetLanguage: typeof fiLanguageCode | typeof svLanguageCode,
    ) => {
      const { getElement, clickElement } = testTools;
      const switcherSelector = selectors.languageSwitchers[targetLanguage];
      await clickElement(switcherSelector);
      await waitFor(() => {
        const languageElement = getElement(selectors.currentLanguage) as HTMLElement;
        if (languageElement.innerHTML !== targetLanguage) {
          throw new Error('Language has not changed');
        }
      });
    };

    const changeDropdownOption = async (testTools: TestTools, option: Option) => {
      await testTools.comboBoxSelector(formikId, option.label);
      await checkInputValue(testTools.getElement, option.value, option.label);

      // First ensure the onChange event has been called with the right value
      await waitFor(() => {
        const changeValue = getLastMockCallArgs(onChangeListener)[0];
        if (changeValue !== option.value) {
          throw new Error('onChange value mismatch');
        }
      });
    };

    it('Changing UI language changes the value of the input, but option.value remains the same', async () => {
      const defaultValue = countryCallingCodes['DE'][0];
      const testTools = await renderAndReturnTestTools({
        defaultValue,
      });
      const selectedOptionBeforeChange = findOptionByValue(optionsInComponent, defaultValue);
      await changeLanguage(testTools, svLanguageCode);
      const selectedOption = findOptionByValue(optionsInComponent, defaultValue);
      expect(selectedOption.label).not.toBe(selectedOptionBeforeChange.label);
      expect(selectedOption.value).toBe(selectedOptionBeforeChange.value);
      await checkInputValue(testTools.getElement, defaultValue, selectedOption.label);
      const values = await submitFormAndReturnData(testTools);
      expect(values).toEqual({ value: selectedOptionBeforeChange.value });
    });
    it('Changing an option changes input and form values', async () => {
      const defaultValue = getDefaultCountryCallingCode();
      const testValues = [
        countryCallingCodes['DK'][0],
        countryCallingCodes['BT'][0],
        countryCallingCodes['FI'][0],
        countryCallingCodes['DO'][0],
        countryCallingCodes['DO'][1],
        countryCallingCodes['DO'][2],
      ];
      const testTools = await renderAndReturnTestTools({
        defaultValue,
      });

      // cannot use forEach with async/await
      for (const nextValue of testValues) {
        const newOption = findOptionByValue(optionsInComponent, nextValue);
        await changeDropdownOption(testTools, newOption);

        // Ensure Formik has had time to update its internal state before checking
        await waitFor(async () => {
          const values = await submitFormAndReturnData(testTools);
          if (values.value !== newOption.value) {
            throw new Error(`Expected form value to be ${newOption.value} but got ${values.value}`);
          }
        });
      }
    }, 15000);
    it(`Using current option prevents visible changes from within the FormikDropdown.
        Button text does not change even when option is changed.
        Form value changes, but the component which set the current option should handle it.
        Button text can match new option if parent sets new currentOption.
        `, async () => {
      const defaultValue = getDefaultCountryCallingCode();
      const currentValue = countryCallingCodes['SK'][0];
      const nextValue = countryCallingCodes['GB'][0];
      const injectedValue = countryCallingCodes['SV'][0];
      const testTools = await renderAndReturnTestTools({
        defaultValue,
        currentValue,
        allowSearch: false,
      });
      const { clickElement, getElement } = testTools;
      const currentOption = findOptionByValue(optionsInComponent, currentValue);
      const newOption = findOptionByValue(optionsInComponent, nextValue);
      await clickElement(selectors.toggleButton);
      await clickElement({ text: newOption.label });
      const values = await submitFormAndReturnData(testTools);
      expect(values).toEqual({ value: newOption.value });
      await checkToggleButtonText(getElement, currentOption.label);
      const injectedOption = findOptionByValue(optionsInComponent, injectedValue);

      injectNewCurrentOption(injectedOption);
      await checkToggleButtonText(getElement, injectedOption.label);
    });
  });
});
