import React from 'react';
import {
  fireEvent,
  RenderResult,
  waitFor,
  cleanup,
} from '@testing-library/react';
import {
  RenderHookResult,
  cleanup as cleanupHooks,
} from '@testing-library/react-hooks';
import { GraphQLError } from 'graphql';
import to from 'await-to-js';

import { resetApolloMocks, ResponseProvider } from './MockApolloClientProvider';
import { AnyObject } from '../../graphql/typings';
import renderComponentTestDOM from './renderComponentTestDOM';

export type ElementSelector = {
  testId?: string;
  text?: string;
  valueSelector?: string;
  id?: string;
  querySelector?: string;
  label?: string;
};

export type RenderHookResultsChildren = {
  children: React.ReactNodeArray;
};

export type WaitForElementAndValueProps = {
  selector: ElementSelector;
  value: string;
};

type ElementGetterResult = HTMLElement | Element | null;

type ComboBoxSelector = (
  selectorPrefix: string,
  value: string
) => Promise<void>;

export type TestTools = RenderResult & {
  getElement: (selector: ElementSelector) => HTMLElement | null;
  waitForIsComplete: () => Promise<void>;
  waitForDataChange: (previousChangeTime?: number) => Promise<void>;
  waitForElement: (selector: ElementSelector) => Promise<void>;
  getTextOrInputValue: (
    selector: ElementSelector
  ) => Promise<string | undefined>;
  fetch: () => Promise<void>;
  clickElement: (selector: ElementSelector) => Promise<HTMLElement | null>;
  submit: (props?: {
    waitForOnSaveNotification?: WaitForElementAndValueProps;
    waitForAfterSaveNotification?: WaitForElementAndValueProps;
    skipDataCheck?: boolean;
    optionalSubmitButtonSelector?: ElementSelector;
  }) => Promise<void>;
  isDisabled: (element: ElementGetterResult) => boolean;
  setInputValue: ({
    target,
    selector,
    newValue,
  }: {
    target?: HTMLElement;
    selector: ElementSelector;
    newValue: string;
  }) => Promise<void>;
  waitForElementAndValue: (props: WaitForElementAndValueProps) => Promise<void>;
  comboBoxSelector: ComboBoxSelector;
};

export const cleanComponentMocks = (): void => {
  cleanup();
  cleanupHooks();
  resetApolloMocks();
};

export const emptyResponseProvider: ResponseProvider = () => ({});
export const submitButtonSelector: ElementSelector = {
  querySelector: 'button[type="submit"]',
};

export const getElementAttribute = async (
  elementGetter: () => ElementGetterResult,
  attribute: string
): Promise<string | null> =>
  waitFor(async () => {
    const element = elementGetter();
    if (!element) {
      throw new Error('No element for getElementAttribute');
    }
    return element.getAttribute(attribute);
  });

export const waitForElementAttributeValue = async (
  elementGetter: () => ElementGetterResult,
  attribute: string,
  value: string | boolean
): Promise<void> => {
  await waitFor(async () => {
    const attributeValue = await getElementAttribute(elementGetter, attribute);
    const booleanMatch = typeof value === 'boolean';
    const match = booleanMatch
      ? (String(attributeValue) === 'true') === value
      : attributeValue === value;

    if (!match) {
      throw new Error('Attribute value mismatch');
    }
  });
};

export const getActiveElement = (
  anyElement?: ElementGetterResult
): Element | null =>
  anyElement ? anyElement.ownerDocument.activeElement : null;

export const waitForElementFocus = async (
  elementGetter: () => ElementGetterResult
): Promise<void> =>
  waitFor(() => {
    const target = elementGetter();
    if (target) {
      expect(getActiveElement(target)).toEqual(target);
    }
  });

export const renderComponentWithMocksAndContexts = async (
  responseProvider: ResponseProvider,
  children: React.ReactElement
): Promise<TestTools> => {
  const renderResult = renderComponentTestDOM(responseProvider, children);
  const getLastTime = (targetElement: string): number => {
    const lastUpdateElement = renderResult.getByTestId(
      `context-as-html-${targetElement}`
    );
    return lastUpdateElement
      ? parseInt(lastUpdateElement.textContent || '-1', 10)
      : -1;
  };

  const getIsComplete = (): boolean => {
    const isCompleteElement = renderResult.getByTestId(
      'context-as-html-isComplete'
    );
    return isCompleteElement ? Boolean(isCompleteElement.textContent) : false;
  };

  const waitForIsComplete: TestTools['waitForIsComplete'] = async () => {
    await waitFor(() => {
      const isComplete = getIsComplete();
      if (!isComplete) {
        throw new Error('NOT COMPLETE');
      }
    });
  };

  const waitForDataChange: TestTools['waitForDataChange'] = async previousChangeTime => {
    const latest = previousChangeTime || getLastTime('dataUpdateTime');
    await waitFor(() => {
      const time = getLastTime('dataUpdateTime');
      if (time <= latest) {
        throw new Error('DATA NOT CHANGED');
      }
    });
  };

  const fetch: TestTools['fetch'] = async () => {
    const fetchButton = renderResult.getByTestId('context-as-html-fetch');
    fireEvent.click(fetchButton);
    return waitForDataChange();
  };

  const getElement: TestTools['getElement'] = ({
    label,
    id,
    testId,
    valueSelector,
    text,
    querySelector,
  }) => {
    if (label) {
      return renderResult.getByLabelText(label);
    }
    if (testId) {
      return renderResult.getByTestId(testId);
    }
    if (text) {
      return renderResult.getByText(text);
    }
    if (valueSelector) {
      return renderResult.getByDisplayValue(valueSelector);
    }
    const selector = querySelector || `#${id}`;
    const element = renderResult.container.querySelector(selector);
    if (!element) {
      // all selectors above throw error if element not found. This should too.
      throw new Error(`Element not found with selector ${selector}`);
    }
    return element as HTMLElement;
  };

  const waitForElement: TestTools['waitForElement'] = async selector => {
    await waitFor(() => {
      getElement(selector);
    });
  };

  const getTextOrInputValue: TestTools['getTextOrInputValue'] = async selector => {
    let value: string | undefined;
    await waitFor(
      () => {
        const element = getElement(selector);
        if (element && !value) {
          if (selector.valueSelector || element.nodeName === 'INPUT') {
            value = (element as HTMLInputElement).value;
          } else {
            value = element.textContent || undefined;
          }
        }
      },
      { timeout: 150 }
    );
    return Promise.resolve(value);
  };

  const clickElement: TestTools['clickElement'] = async selector => {
    const button = getElement(selector);
    await waitFor(() => {
      fireEvent.click(button as Element);
    });
    return Promise.resolve(button);
  };

  const isDisabled: TestTools['isDisabled'] = element =>
    !!element && element.getAttribute('disabled') !== null;

  const waitForElementAndValue: TestTools['waitForElementAndValue'] = async props => {
    const { selector, value } = props;
    return waitFor(async () => {
      const elementValue = await getTextOrInputValue(selector);
      if (value === '' && elementValue === '') {
        return;
      }
      if (!elementValue || !elementValue.includes(value)) {
        throw new Error(
          `element value (${elementValue}) does not include given value ${value}`
        );
      }
    });
  };

  const submit: TestTools['submit'] = async ({
    waitForOnSaveNotification,
    waitForAfterSaveNotification,
    skipDataCheck,
    optionalSubmitButtonSelector,
  } = {}) => {
    const previousDataChangeTime = getLastTime('dataUpdateTime');
    const currentSubmitButtonSelector =
      optionalSubmitButtonSelector || submitButtonSelector;
    await clickElement(currentSubmitButtonSelector);
    if (waitForOnSaveNotification) {
      await waitForElementAndValue(waitForOnSaveNotification);
    }
    await waitFor(() => {
      if (!isDisabled(getElement(currentSubmitButtonSelector))) {
        throw new Error('NOT DISABLED');
      }
    });
    if (waitForAfterSaveNotification) {
      await waitForElementAndValue(waitForAfterSaveNotification);
    }
    if (!skipDataCheck) {
      await waitForDataChange(previousDataChangeTime);
    }
  };

  const setInputValue: TestTools['setInputValue'] = async props => {
    const { newValue, target, selector } = props;
    const input = target || getElement(selector);
    await waitFor(() => {
      fireEvent.change(input as HTMLElement, { target: { value: newValue } });
    });

    return waitFor(
      async () => {
        await waitForElementAndValue({ selector, value: newValue });
      },
      { timeout: 60 }
    );
  };

  const comboBoxSelector: ComboBoxSelector = async (selectorPrefix, value) => {
    const inputSelector = { id: `${selectorPrefix}-input` };
    const currentValue = await getTextOrInputValue(inputSelector);
    if (currentValue) {
      await setInputValue({
        selector: inputSelector,
        newValue: '',
      });
      await waitForElementAndValue({
        selector: inputSelector,
        value: '',
      });
    } else {
      await clickElement({
        id: `${selectorPrefix}-toggle-button`,
      });
    }
    // click toggle-button to blur input and show error when value is empty
    if (!value) {
      await clickElement({
        id: `${selectorPrefix}-toggle-button`,
      });
      return;
    }
    if (currentValue === value) {
      throw new Error(
        'Do not try to change value to same value. Change cannot be detected reliably.'
      );
    }
    // menu is auto-opened when input changes
    // click the element with value as text
    await clickElement({ text: value });
    await waitForElementAndValue({
      selector: inputSelector,
      value,
    });
    // wait for combobox input to have the value
    await waitForElement({ valueSelector: value });
  };

  return Promise.resolve({
    ...renderResult,
    getElement,
    waitForIsComplete,
    waitForDataChange,
    waitForElement,
    getTextOrInputValue,
    fetch,
    clickElement,
    submit,
    isDisabled,
    setInputValue,
    waitForElementAndValue,
    comboBoxSelector,
  });
};

export const createResultPropertyTracker = <T>({
  renderHookResult,
  valuePicker,
}: {
  renderHookResult: RenderHookResult<RenderHookResultsChildren, T>;
  valuePicker: (props: T) => string | undefined | AnyObject;
}): [() => Promise<void>] => {
  const currentPicker = (): T => renderHookResult.result.current;
  const waitForChange = () => {
    const initialValue = valuePicker(currentPicker());
    return waitFor(() => {
      const newValue = valuePicker(currentPicker());
      if (newValue === initialValue) {
        throw new Error('waiting...');
      }
    });
  };

  return [waitForChange];
};

export const getErrorMessage = (error?: Error | GraphQLError): string => {
  if (!error) {
    return '';
  }
  const retypedError = (error as unknown) as {
    message: string;
    networkError: string | { body: string };
  };
  if (retypedError.networkError) {
    return typeof retypedError.networkError !== 'string'
      ? retypedError.networkError.body
      : retypedError.networkError;
  }
  return retypedError.message;
};

export const createDomHelpersWithTesting = (
  renderResult: RenderResult
): {
  findByTestId: (testId: string) => Promise<HTMLElement | null>;
  findById: (id: string) => Promise<HTMLElement | null>;
  click: (target: HTMLElement) => Promise<void>;
} => ({
  findByTestId: async (testId: string): Promise<HTMLElement | null> => {
    const [, el] = await to(renderResult.findByTestId(testId));
    return Promise.resolve(el || null);
  },
  findById: async (id: string): Promise<HTMLElement | null> => {
    const el = renderResult.baseElement.querySelector(`#${id}`);
    return Promise.resolve((el as HTMLElement) || null);
  },
  click: async (target: HTMLElement) => {
    expect(!!target).toBeTruthy();
    await waitFor(() => {
      fireEvent.click(target as Element);
    });
    Promise.resolve();
  },
});
