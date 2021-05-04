import React, { useContext } from 'react';
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
import {
  MutationReturnType,
  useProfileMutations,
} from '../../profile/hooks/useProfileMutations';
import { EditDataType } from '../../profile/helpers/editData';
import ProfileContextFetcher from './ProfileContextFetcher';
import { getErrorMessage } from './testingLibraryTools';

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
