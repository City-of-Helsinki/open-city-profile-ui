import { ApolloError } from '@apollo/client';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { MyProfileQuery } from '../../../graphql/generatedTypes';
import { useProfileQuery, QueryResult } from '../../helpers/hooks';

type ContextProps = {
  children: React.ReactNode | React.ReactNode[] | null;
};

type ErrorListener = (e: ApolloError | Error) => void;
type ErrorDisposer = () => void;

export type ProfileContextData = {
  data?: MyProfileQuery;
  updateTime: number;
  updateProfileContext: (data: MyProfileQuery) => void;
  error?: ApolloError | Error;
  loading: boolean;
  addErrorListener: (listener: ErrorListener) => ErrorDisposer;
  fetch: () => void;
  refetch: () => Promise<QueryResult>;
  isInitialized: boolean;
  isComplete: boolean;
  getName: (preferNickOrGivenName?: boolean) => string;
};

export const ProfileContext = createContext<ProfileContextData>({
  data: undefined,
  updateTime: -1,
  updateProfileContext: () => undefined,
  loading: false,
  addErrorListener: () => () => undefined,
  fetch: () => undefined,
  refetch: () => Promise.reject(),
  isInitialized: false,
  isComplete: false,
  getName: () => '',
});

export const Provider = (props: ContextProps): React.ReactElement => {
  const { children } = props;

  const errorListeners = useRef({ listeners: new Set<ErrorListener>() });
  const triggerListeners: (
    triggeredError: ApolloError | Error
  ) => void = useCallback(
    errorObject => {
      errorListeners.current.listeners.forEach(listener =>
        listener(errorObject)
      );
    },
    [errorListeners]
  );
  const { data, loading, error, fetch, refetch } = useProfileQuery({
    onError: (queryError: ApolloError) => {
      triggerListeners(queryError);
    },
  });
  const [profileData, updateData] = useState(data);
  const loadStateTracker = useRef({
    updateTime: profileData && profileData.myProfile ? Date.now() : 0,
    isLoading: loading,
  });

  const updateProfileContext: ProfileContextData['updateProfileContext'] = useCallback(
    newProfileData => {
      loadStateTracker.current.updateTime = Date.now();
      updateData(newProfileData);
    },
    [updateData]
  );

  const hasBeenCalled =
    loading ||
    loadStateTracker.current.isLoading ||
    loadStateTracker.current.updateTime > 0;

  const isComplete =
    hasBeenCalled && !!profileData && loadStateTracker.current.updateTime > 0;

  const fetchDataIfNotLoaded: ProfileContextData['fetch'] = useCallback(() => {
    if (hasBeenCalled) {
      return;
    }
    fetch();
  }, [fetch, hasBeenCalled]);

  const refetchDataIfPossible: ProfileContextData['refetch'] = useCallback(() => {
    if (!refetch) {
      return Promise.reject(
        new Error('Cannot refetch before first fetch is done. Fetch first.')
      );
    }
    return refetch();
  }, [refetch]);

  const loadStarted = loadStateTracker.current.isLoading;
  if (loadStarted && loading === false && data) {
    loadStateTracker.current.isLoading = false;
    updateProfileContext(data);
  } else if (!loadStarted && loading) {
    loadStateTracker.current.isLoading = true;
  } else if (!profileData && data && !loading) {
    updateProfileContext(data);
  }

  const contextData: ProfileContextData = {
    data: profileData,
    updateTime: loadStateTracker.current.updateTime,
    updateProfileContext,
    loading,
    error,
    addErrorListener: f => {
      errorListeners.current.listeners.add(f);
      return () => errorListeners.current.listeners.delete(f);
    },
    fetch: fetchDataIfNotLoaded,
    refetch: refetchDataIfPossible,
    isInitialized: hasBeenCalled,
    isComplete,
    getName: preferNickOrGivenName => {
      if (!isComplete || !profileData || !profileData.myProfile) {
        return 'NONE';
      }
      if (profileData.myProfile.verifiedPersonalInformation) {
        const source = profileData.myProfile.verifiedPersonalInformation;
        return `${
          preferNickOrGivenName && source.givenName
            ? source.givenName
            : source.firstName
        } ${source.lastName}`;
      } else {
        const source = profileData.myProfile;
        return preferNickOrGivenName && source.nickname
          ? source.nickname
          : `${source.firstName} ${source.lastName}`;
      }
    },
  };

  return (
    <ProfileContext.Provider value={contextData}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileListener = (listener: ErrorListener): void => {
  const { addErrorListener } = useContext(ProfileContext);
  const disposerRef = useRef<{ disposer: () => void } | undefined>({
    disposer: addErrorListener(listener),
  });
  useEffect(
    () => () => {
      disposerRef.current &&
        disposerRef.current.disposer &&
        disposerRef.current.disposer();
      disposerRef.current = undefined;
    },
    [disposerRef]
  );
};

export const { Consumer } = ProfileContext;
