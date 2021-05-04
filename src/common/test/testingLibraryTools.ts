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
  isDisabled: (element: HTMLElement | Element | null) => boolean;
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

export const waitForElementAttributeValue = async (
  elementGetter: () => HTMLElement | Element | null,
  attribute: string,
  value: string
): Promise<void> => {
  await waitFor(async () => {
    const element = elementGetter();
    const attributeValue = element && element.getAttribute(attribute);
    if (attributeValue !== value) {
      throw new Error('Attribute value mismatch');
    }
  });
};

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
    fireEvent.click(button as Element);
    return Promise.resolve(button);
  };

  const isDisabled: TestTools['isDisabled'] = element =>
    !!element && element.getAttribute('disabled') !== null;

  const submit: TestTools['submit'] = async ({
    waitForOnSaveNotification,
    waitForAfterSaveNotification,
    skipDataCheck,
    optionalSubmitButtonSelector,
  } = {}) => {
    const previousDataChangeTime = getLastTime('dataUpdateTime');
    const submitButton = await clickElement(
      optionalSubmitButtonSelector || submitButtonSelector
    );
    if (waitForOnSaveNotification) {
      await waitForElementAndValue(waitForOnSaveNotification);
    }
    await waitFor(() => {
      if (!isDisabled(submitButton)) {
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

  const waitForElementAndValue: TestTools['waitForElementAndValue'] = async props => {
    const { selector, value } = props;
    return waitFor(async () => {
      const elementValue = await getTextOrInputValue(selector);
      if (value === '' && elementValue === '') {
        return;
      }
      if (!elementValue || !elementValue.includes(value)) {
        throw new Error('element value does not match given value');
      }
    });
  };

  const setInputValue: TestTools['setInputValue'] = async props => {
    const { newValue, target, selector } = props;
    const input = target || getElement(selector);
    fireEvent.change(input as HTMLElement, { target: { value: newValue } });

    return waitFor(
      async () => {
        await waitForElementAndValue({ selector, value: newValue });
      },
      { timeout: 60 }
    );
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
    return new Promise<void>(async resolve => {
      await waitFor(() => {
        const newValue = valuePicker(currentPicker());
        if (newValue !== initialValue) {
          resolve();
        } else {
          throw new Error('waiting...');
        }
      });
    });
  };

  return [waitForChange];
};

export const getErrorMessage = (error?: Error | GraphQLError): string => {
  if (!error) {
    return '';
  }
  const retypedError = (error as unknown) as AnyObject<string>;
  if (retypedError.networkError) {
    return retypedError.networkError;
  }
  return retypedError.message;
};
