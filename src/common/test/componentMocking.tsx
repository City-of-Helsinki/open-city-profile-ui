import React, { useContext } from 'react';
import { renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import {
  render,
  RenderResult,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import _ from 'lodash';

import { MyProfileQuery } from '../../graphql/generatedTypes';
import {
  ProfileContext,
  ProfileContextData,
  Provider as ProfileProvider,
} from '../../profile/components/context/ProfileContext';
import { EditData } from '../../profile/helpers/mutationEditor';
import ToastProvider from '../../toast/ToastProvider';

type ElementSelector = {
  label?: string;
  id?: string;
  testId?: string;
  valueSelector?: string;
  text?: string;
  querySelector?: string;
};

export type TestTools = RenderResult & {
  submit: (props?: {
    checkNotificationContent?: string;
    waitForResult?: () => Promise<void>;
  }) => Promise<Record<string, unknown>>;
  setInputValue: ({
    target,
    selector,
    newValue,
  }: {
    target?: HTMLElement;
    selector: ElementSelector;
    newValue: string;
  }) => Promise<void>;
  getElement: (selector: ElementSelector) => HTMLElement | null;
  waitForNextTick: () => Promise<void>;
  triggerAction: (selector: ElementSelector) => Promise<void>;
  getTextOrInputValue: (
    selector: ElementSelector
  ) => Promise<string | undefined>;
  createWaitForElement: (
    selector: ElementSelector,
    value?: string
  ) => () => Promise<void>;
  createWaitForDataChange: () => () => Promise<void>;
  isDisabled: (element: HTMLElement | Element | null) => boolean;
};

const NO_DATA_CONTENT = 'NO_DATA';

export const ContextAsHTML = (): React.ReactElement => {
  const { data, loading, updateTime } = useContext(ProfileContext);
  return (
    <div data-testid="context-as-html">
      <div data-testid="context-as-html-data">{JSON.stringify(data)}</div>
      <div data-testid="context-as-html-loading">{loading}</div>
      <div data-testid="context-as-html-updateTime">{updateTime}</div>
    </div>
  );
};

export const AutoFetchProfileContext = ({
  children,
}: {
  children: React.ReactElement | React.ReactNodeArray;
}): React.ReactElement => {
  const { data, fetch } = useContext(ProfileContext);
  act(() => {
    fetch();
  });
  if (!data) {
    return <p>{NO_DATA_CONTENT}</p>;
  }
  return (
    <div data-testid="test-elements">
      <div data-testid="component">{children}</div>
      <ContextAsHTML />
    </div>
  );
};

export const exposeProfileContext = (
  mocks: MockedResponse[]
): RenderHookResult<
  {
    children: React.ReactNodeArray;
  },
  ProfileContextData
> & {
  waitForDataChange: () => Promise<ProfileContextData>;
  waitForUpdate: () => Promise<ProfileContextData>;
} => {
  const wrapper = ({ children }: { children: React.ReactNodeArray }) => (
    <MockedProvider mocks={mocks}>
      <ProfileProvider>{children}</ProfileProvider>
    </MockedProvider>
  );
  const createUpdateProps = (
    contextData: ProfileContextData
  ): Record<string, unknown> => ({
    loading: contextData.loading,
    updateTime: contextData.updateTime,
    isComplete: contextData.isComplete,
    error: contextData.error,
  });
  let lastUpdate: Record<string, unknown> = {};
  let updateChangeResolver:
    | null
    | ((newContextData: ProfileContextData) => void);

  //testing-library has waitForNextUpdate but it does not work properly!
  const waitForUpdate = () =>
    new Promise<ProfileContextData>(resolve => {
      updateChangeResolver = resolve;
    });
  const trackUpdateChanges = (newContext: ProfileContextData): void => {
    const updateProps = createUpdateProps(newContext);
    if (!_.isEqual(lastUpdate, updateProps)) {
      lastUpdate = updateProps;
      updateChangeResolver && updateChangeResolver(newContext);
    }
  };

  let lastUpdateTime = 0;
  let dataChangeResolver: null | ((newContextData: ProfileContextData) => void);

  const waitForDataChange = () =>
    new Promise<ProfileContextData>(resolve => {
      dataChangeResolver = resolve;
    });

  const trackDataChanges = (newContext: ProfileContextData): void => {
    if (newContext.updateTime > lastUpdateTime) {
      lastUpdateTime = newContext.updateTime;
      dataChangeResolver && dataChangeResolver(newContext);
    }
  };

  const tracker = (newContextData: ProfileContextData) => {
    // console.log('####tracker', newContextData.updateTime);
    trackDataChanges(newContextData);
    trackUpdateChanges(newContextData);
    return newContextData;
  };
  const callback = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tracker(useContext(ProfileContext));

  const result = renderHook(callback, { wrapper });
  return { ...result, waitForDataChange, waitForUpdate };
};

export const renderProfileContextWrapper = async (
  mocks: MockedResponse[],
  children: React.ReactElement,
  dataType: EditData['dataType']
): Promise<TestTools> => {
  let currentProfileData = mocks[0] && (mocks[0].result as MyProfileQuery);
  if (!currentProfileData) {
    throw new Error('Initial MyProfile data must be set');
  }

  const updateCurrentData = (newData: MyProfileQuery): void => {
    currentProfileData = newData;
  };

  const renderResult = render(
    <MockedProvider mocks={mocks}>
      <ToastProvider>
        <ProfileProvider>
          <AutoFetchProfileContext>{children}</AutoFetchProfileContext>
        </ProfileProvider>
      </ToastProvider>
    </MockedProvider>
  );

  await waitFor(() => {
    let noDataElement;

    try {
      noDataElement = renderResult.getByText(NO_DATA_CONTENT);
    } catch (e) {
      //this is ok
    }

    if (noDataElement) {
      throw new Error('DATA NOT LOADED');
    }
  });

  const getLastUpdateTime = (): number => {
    const lastUpdateElement = renderResult.getByTestId(
      'context-as-html-updateTime'
    );
    return lastUpdateElement
      ? parseInt(lastUpdateElement.textContent || '-1', 10)
      : -1;
  };

  const getData = () => {
    const dataElement = renderResult.getByTestId('context-as-html-data');
    return dataElement
      ? JSON.parse(dataElement.textContent || '{}')
      : undefined;
  };

  const updateCurrentDataFromHTML = (): MyProfileQuery => {
    const data = getData();
    if (!data) {
      throw new Error('Invalid profile data in HTML');
    }
    updateCurrentData(data);
    return data;
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

  const isDisabled: TestTools['isDisabled'] = element =>
    !!element && element.getAttribute('disabled') !== null;

  const setInputValue: TestTools['setInputValue'] = async props => {
    const { newValue, target, selector } = props;
    const input = target || getElement(selector);
    fireEvent.change(input as HTMLElement, { target: { value: newValue } });

    return waitFor(
      () => {
        getElement({ valueSelector: newValue });
      },
      { timeout: 60 }
    );
  };

  const waitForNextTick: TestTools['waitForNextTick'] = async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  };

  const createWaitForDataChange: TestTools['createWaitForDataChange'] = () => {
    const lastUpdateTime = getLastUpdateTime();
    return async () => {
      await waitFor(() => {
        const updateTime = getLastUpdateTime();
        if (updateTime <= lastUpdateTime) {
          throw new Error('NOT UPDATED');
        }
        updateCurrentDataFromHTML();
      });
    };
  };

  const submit: TestTools['submit'] = async ({
    checkNotificationContent,
    waitForResult,
  } = {}): Promise<Record<string, unknown>> => {
    const waitForDataChange = createWaitForDataChange();
    await act(async () => {
      const submitButton = renderResult.container.querySelectorAll(
        'button[type="submit"]'
      );
      fireEvent.click(submitButton[0]);
      if (checkNotificationContent) {
        await waitFor(() => {
          getElement({ text: checkNotificationContent });
        });
      }
      await waitFor(() => {
        if (!isDisabled(submitButton[0])) {
          throw new Error('NOT DISABLED');
        }
      });
      return Promise.resolve();
    });
    if (waitForResult) {
      await waitForResult();
    } else {
      await waitForDataChange();
    }
    return Promise.resolve({});
  };

  const triggerAction: TestTools['triggerAction'] = async selector => {
    await act(async () => {
      const editbutton = getElement(selector);
      fireEvent.click(editbutton as Element);
      return Promise.resolve();
    });
    return Promise.resolve();
  };

  const getTextOrInputValue: TestTools['getTextOrInputValue'] = async selector => {
    let value: string | undefined;
    await waitFor(
      () => {
        const element = getElement(selector);
        if (element && !value) {
          if (selector.valueSelector) {
            value = (element as HTMLInputElement).value;
          }
          value = element.textContent || undefined;
        }
      },
      { timeout: 150 }
    );
    return Promise.resolve(value);
  };

  const createWaitForElement: TestTools['createWaitForElement'] = (
    selector,
    value
  ) => async () => {
    const elementValue = await getTextOrInputValue(selector);
    if (value && (!elementValue || !elementValue.includes(value))) {
      throw new Error('elementValue vs value mismatch');
    }
  };

  return Promise.resolve({
    ...renderResult,
    submit,
    setInputValue,
    getElement,
    waitForNextTick,
    triggerAction,
    getTextOrInputValue,
    createWaitForElement,
    createWaitForDataChange,
    isDisabled,
  });
};
