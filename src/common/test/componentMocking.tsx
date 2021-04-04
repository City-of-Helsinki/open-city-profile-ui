import React, { useContext } from 'react';
import { render, RenderResult } from '@testing-library/react';
import { renderHook, RenderHookResult } from '@testing-library/react-hooks';
import _ from 'lodash';

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

type ElementSelector = {
  testId?: string;
  text?: string;
};

export type TestTools = RenderResult & {
  getElement: (selector: ElementSelector) => HTMLElement | null;
};

export const renderProfileContextWrapper = async (
  children: React.ReactElement
): Promise<TestTools> => {
  const renderResult = render(<React.Fragment>{children}</React.Fragment>);

  const getElement: TestTools['getElement'] = ({ testId, text }) => {
    if (testId) {
      return renderResult.getByTestId(testId);
    }
    if (text) {
      return renderResult.getByText(text);
    }
    throw new Error('getElement selector not set');
  };

  return Promise.resolve({
    ...renderResult,
    getElement,
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
    const getErrorMessage = (error?: AnyObject<string>): string => {
      if (!error) {
        return '';
      }
      if (error.networkError) {
        return error.networkError;
      }
      return error.message;
    };
    const errorMessage = getErrorMessage(
      (newContext.error as unknown) as AnyObject<string>
    );
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
