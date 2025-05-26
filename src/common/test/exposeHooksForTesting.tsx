import React, { useContext, PropsWithChildren } from 'react';
import { renderHook, RenderHookResult } from '@testing-library/react';
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

export const exposeProfileContext = (
  responseProvider: ResponseProvider
): RenderHookResult<PropsWithChildren<object>, ProfileContextData> & {
  result: { current: ProfileContextData }; // Structure to match old API
  waitForDataChange: () => Promise<ProfileContextData>;
  waitForUpdate: () => Promise<ProfileContextData>;
  waitForErrorChange: () => Promise<ProfileContextData>;
} => {
  const wrapper = ({ children }: PropsWithChildren<object>) => (
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

  // Modify how you handle the result to maintain compatibility
  const hookResult = renderHook(callback, { wrapper });

  // Return with structure matching the old API
  return {
    result: hookResult.result,
    waitForDataChange,
    waitForUpdate,
    waitForErrorChange,
    rerender: hookResult.rerender,
    unmount: hookResult.unmount,
  };
};

export function exposeHook<T = unknown>(
  responseProvider: ResponseProvider,
  hookProvider: () => T,
  waitForProfileData: boolean
): {
  result: {
    current: T & { [key: string]: unknown }; // Allow any property to be accessed on current
  };
  rerender: (props?: unknown) => void;
  unmount: () => void;
  // The test explicitly looks for profileData from the context
  waitForDataChange?: () => Promise<void>;
} {
  const ChildWrapper = waitForProfileData
    ? ProfileContextFetcher
    : React.Fragment;

  const wrapper = ({ children }: PropsWithChildren<object>) => (
    <MockApolloClientProvider responseProvider={responseProvider}>
      <ProfileProvider>
        <ChildWrapper>{<>{children}</>}</ChildWrapper>
      </ProfileProvider>
    </MockApolloClientProvider>
  );

  const callback = () => hookProvider();

  // Store the renderHook result
  const hookResult = renderHook(callback, { wrapper });

  // Return with complete implementation
  return {
    result: (hookResult.result as unknown) as {
      current: T & { [key: string]: unknown };
    },
    rerender: hookResult.rerender,
    unmount: hookResult.unmount,
  };
}

export const exposeProfileMutationsHook = (
  responseProvider: ResponseProvider,
  dataType: EditDataType
): {
  result: {
    current: MutationReturnType & { [key: string]: unknown }; // Allow any property to be accessed on current
  };
  rerender: (props?: unknown) => void;
  unmount: () => void;
  waitForDataChange?: () => Promise<void>;
} =>
  exposeHook<MutationReturnType>(
    responseProvider,
    () =>
      useProfileMutations({
        dataType,
      }),
    true
  );
