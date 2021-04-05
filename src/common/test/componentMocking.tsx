import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  waitFor,
} from '@testing-library/react';
import { renderHook, RenderHookResult } from '@testing-library/react-hooks';
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
  ResponseProvider,
} from './MockApolloClientProvider';
import { AnyObject } from '../../graphql/typings';
import ToastProvider from '../../toast/__mocks__/ToastProvider';

type ElementSelector = {
  testId?: string;
  text?: string;
};

export type TestTools = RenderResult & {
  getElement: (selector: ElementSelector) => HTMLElement | null;
  waitForIsComplete: () => Promise<void>;
  waitForDataChange: () => Promise<void>;
  waitForElement: (selector: ElementSelector) => Promise<void>;
  fetch: () => Promise<void>;
};

export const emptyResponseProvider: ResponseProvider = () => ({});

export const renderProfileContextWrapper = async (
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

  const waitForDataChange: TestTools['waitForDataChange'] = async () => {
    const latest = getLastTime('dataUpdateTime');
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

  const getElement: TestTools['getElement'] = ({ testId, text }) => {
    if (testId) {
      return renderResult.getByTestId(testId);
    }
    if (text) {
      return renderResult.getByText(text);
    }
    throw new Error('getElement selector not set');
  };

  const waitForElement: TestTools['waitForElement'] = async selector => {
    await waitFor(() => {
      getElement(selector);
    });
  };

  return Promise.resolve({
    ...renderResult,
    getElement,
    waitForIsComplete,
    waitForDataChange,
    waitForElement,
    fetch,
  });
};

export const exposeProfileContext = (
  responseProvider: ResponseProvider
): RenderHookResult<
  {
    children: React.ReactNodeArray;
  },
  ProfileContextData
> & {
  waitForDataChange: () => Promise<ProfileContextData>;
  waitForUpdate: () => Promise<ProfileContextData>;
  waitForErrorChange: () => Promise<ProfileContextData>;
} => {
  const wrapper = ({ children }: { children: React.ReactNodeArray }) => (
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
