import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  waitFor,
  cleanup,
} from '@testing-library/react';
import {
  renderHook,
  RenderHookResult,
  cleanup as cleanupHooks,
} from '@testing-library/react-hooks';
import _ from 'lodash';
import { GraphQLError } from 'graphql';
import { BrowserRouter } from 'react-router-dom';

import {
  ProfileContext,
  ProfileContextData,
  Provider as ProfileProvider,
} from '../../profile/context/ProfileContext';
import {
  MockApolloClientProvider,
  resetApolloMocks,
  ResponseProvider,
} from './MockApolloClientProvider';
import { AnyObject } from '../../graphql/typings';
import ToastProvider from '../../toast/__mocks__/ToastProvider';
import {
  MutationReturnType,
  useProfileMutations,
} from '../../profile/hooks/useProfileMutations';
import { EditDataType } from '../../profile/helpers/editData';

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
  const renderResult = render(
    <BrowserRouter>
      <MockApolloClientProvider responseProvider={responseProvider}>
        <ProfileProvider>
          <ToastProvider>{children}</ToastProvider>
          <ProfileContextAsHTML />
        </ProfileProvider>
      </MockApolloClientProvider>
    </BrowserRouter>
  );

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

export const exposeProfileContext = (
  responseProvider: ResponseProvider
): RenderHookResult<RenderHookResultsChildren, ProfileContextData> & {
  waitForDataChange: () => Promise<ProfileContextData>;
  waitForUpdate: () => Promise<ProfileContextData>;
  waitForErrorChange: () => Promise<ProfileContextData>;
} => {
  const wrapper = ({ children }: RenderHookResultsChildren) => (
    <MockApolloClientProvider responseProvider={responseProvider}>
      <ProfileProvider>{children}</ProfileProvider>
    </MockApolloClientProvider>
  );
  const createUpdateProps = (
    contextData: ProfileContextData
  ): Record<string, unknown> => ({
    loading: contextData.loading,
    isComplete: contextData.isComplete,
  });
  const lastError = {
    message: '',
  };
  let lastUpdate: Record<string, unknown> = {};
  let lastData: string | undefined;
  let updateChangeResolver:
    | ((newContextData: ProfileContextData) => void)
    | undefined;
  let dataChangeResolver:
    | ((newContextData: ProfileContextData) => void)
    | undefined;
  let errorChangeResolver:
    | ((newContextData: ProfileContextData) => void)
    | undefined;

  //testing-library has waitForNextUpdate but it does not work properly!
  const waitForUpdate = () =>
    new Promise<ProfileContextData>(resolve => {
      updateChangeResolver = resolve;
    });
  const waitForDataChange = () =>
    new Promise<ProfileContextData>(resolve => {
      dataChangeResolver = resolve;
    });
  const waitForErrorChange = () =>
    new Promise<ProfileContextData>(resolve => {
      errorChangeResolver = resolve;
    });

  const trackUpdateChanges = (newContext: ProfileContextData): void => {
    const updateProps = createUpdateProps(newContext);
    if (!_.isEqual(lastUpdate, updateProps)) {
      lastUpdate = updateProps;
      updateChangeResolver && updateChangeResolver(newContext);
    }
  };

  const trackDataChanges = (newContext: ProfileContextData): void => {
    const newData = JSON.stringify(newContext.data || {});
    if (newData !== lastData) {
      dataChangeResolver && dataChangeResolver(newContext);
      dataChangeResolver = undefined;
      lastData = newData;
    }
  };

  const trackErrorChanges = (newContext: ProfileContextData): void => {
    const errorMessage = getErrorMessage(newContext.error);
    if (errorMessage !== lastError.message) {
      lastError.message = errorMessage;
      errorChangeResolver && errorChangeResolver(newContext);
    }
  };

  const tracker = (newContextData: ProfileContextData) => {
    trackDataChanges(newContextData);
    trackUpdateChanges(newContextData);
    trackErrorChanges(newContextData);
    return newContextData;
  };
  const callback = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tracker(useContext(ProfileContext));

  const result = renderHook(callback, { wrapper });
  return { ...result, waitForDataChange, waitForUpdate, waitForErrorChange };
};

export const createResultPropertyTracker = <T,>({
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

export const exposeProfileMutationsHook = (
  responseProvider: ResponseProvider,
  dataType: EditDataType
): RenderHookResult<RenderHookResultsChildren, MutationReturnType> => {
  const wrapper = ({ children }: RenderHookResultsChildren) => (
    <MockApolloClientProvider responseProvider={responseProvider}>
      <ProfileProvider>
        <ProfileContextFetcher>{children}</ProfileContextFetcher>
      </ProfileProvider>
    </MockApolloClientProvider>
  );

  const callback = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useProfileMutations({
      dataType,
    });

  return renderHook(callback, { wrapper });
};

export const ProfileContextFetcher = ({
  children,
}: {
  children: React.ReactElement | React.ReactNodeArray;
}): React.ReactElement => {
  const [fetchStarted, setFetchStarted] = useState(false);
  const { data, fetch } = useContext(ProfileContext);
  if (!fetchStarted) {
    fetch();
    setFetchStarted(true);
  }

  if (!data) {
    return <div data-testid="no-data-fetched"></div>;
  }
  return (
    <div data-testid="test-elements">
      <div data-testid="component">{children}</div>
    </div>
  );
};

export const ProfileContextAsHTML = (): React.ReactElement => {
  const { data, isComplete, error, fetch, refetch } = useContext(
    ProfileContext
  );
  const [updateTime, setUpdateTime] = useState<number>(-1);
  const [dataUpdateTime, setDataUpdateTime] = useState<number>(-1);
  const errorMessage = getErrorMessage(error);
  const dataTracker = useRef<string>(JSON.stringify(data || {}));
  useEffect(() => {
    const dataAsString = JSON.stringify(data || {});
    if (dataAsString !== dataTracker.current) {
      dataTracker.current = dataAsString;
      setDataUpdateTime(Date.now());
    }
    setUpdateTime(Date.now());
  }, [data, errorMessage, isComplete]);
  const onButtonClick = () => (isComplete ? refetch() : fetch());
  return (
    <div data-testid="context-as-html">
      <div data-testid="context-as-html-isComplete">{String(isComplete)}</div>
      <div data-testid="context-as-html-error">{errorMessage}</div>
      <div data-testid="context-as-html-updateTime">{updateTime}</div>
      <div data-testid="context-as-html-dataUpdateTime">{dataUpdateTime}</div>
      <button onClick={onButtonClick} data-testid="context-as-html-fetch">
        Fetch
      </button>
    </div>
  );
};

const getErrorMessage = (error?: Error | GraphQLError): string => {
  if (!error) {
    return '';
  }
  const retypedError = (error as unknown) as AnyObject<string>;
  if (retypedError.networkError) {
    return retypedError.networkError;
  }
  return retypedError.message;
};

export const RenderChildrenWhenDataIsComplete = ({
  children,
}: {
  children: React.ReactElement | React.ReactNodeArray;
}): React.ReactElement | null => {
  const { isComplete } = useContext(ProfileContext);
  if (!isComplete) {
    return null;
  }
  return <div data-testid="component-wrapper">{children}</div>;
};
