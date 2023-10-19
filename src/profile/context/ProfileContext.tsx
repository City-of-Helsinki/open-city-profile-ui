import { ApolloError } from '@apollo/client';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMemoizedFn } from 'ahooks';

import { ProfileRoot } from '../../graphql/typings';
import getVerifiedPersonalInformation from '../helpers/getVerifiedPersonalInformation';
import { useProfileQuery, QueryResult } from '../hooks/useProfileQuery';
import parseGraphQLError from '../helpers/parseGraphQLError';
import reportErrorsToSentry from '../../common/sentry/reportGraphQlErrors';

type ContextProps = {
  children: React.ReactNode | React.ReactNode[] | null;
};

type ErrorListener = (e: ApolloError | Error) => void;
type ErrorDisposer = () => void;

export type ProfileContextData = {
  data?: ProfileRoot;
  updateProfileData: (data: ProfileRoot) => void;
  error?: ApolloError | Error;
  loading: boolean;
  addErrorListener: (listener: ErrorListener) => ErrorDisposer;
  fetch: () => void;
  refetch: () => Promise<QueryResult>;
  isInitialized: boolean;
  isComplete: boolean;
  getName: (preferNickOrGivenName?: boolean) => string;
  getProfile: () => ProfileRoot | null;
};

const reportErrorToSentry = (apolloError: ApolloError) => {
  if (parseGraphQLError(apolloError).isAllowedError) {
    return;
  }
  reportErrorsToSentry(apolloError);
};

export const ProfileContext = createContext<ProfileContextData>({
  data: undefined,
  updateProfileData: () => undefined,
  loading: false,
  addErrorListener: () => () => undefined,
  fetch: () => {
    throw new Error('Use context provider to initialize ProfileContext');
  },
  refetch: () => Promise.reject(),
  isInitialized: false,
  isComplete: false,
  getName: () => '',
  getProfile: () => null,
});

export const Provider = (props: ContextProps): React.ReactElement => {
  const { children } = props;

  const errorListeners = useRef({ listeners: new Set<ErrorListener>() });
  const triggerListeners: (
    triggeredError: ApolloError | Error
  ) => void = useCallback(errorObject => {
    errorListeners.current.listeners.forEach(listener => listener(errorObject));
  }, []);
  const addErrorListener: ProfileContextData['addErrorListener'] = useCallback(
    f => {
      errorListeners.current.listeners.add(f);
      return () => errorListeners.current.listeners.delete(f);
    },
    []
  );

  const { data, loading, error, fetch, refetch } = useProfileQuery({
    onError: (queryError: ApolloError) => {
      triggerListeners(queryError);
      reportErrorToSentry(queryError);
    },
  });
  const [profileData, updateData] = useState(data);
  const loadTracker = useRef({
    started: false,
    complete: false,
    loading: false,
  });

  const updateProfileData: ProfileContextData['updateProfileData'] = useCallback(
    newProfileData => {
      loadTracker.current.complete = true;
      updateData(newProfileData);
    },
    [updateData]
  );

  const fetchDataIfNotLoaded: ProfileContextData['fetch'] = useCallback(() => {
    if (loadTracker.current.started) {
      return;
    }
    loadTracker.current.started = true;
    loadTracker.current.loading = true;
    fetch();
  }, [fetch, loadTracker]);

  const refetchDataIfPossible: ProfileContextData['refetch'] = useCallback(() => {
    if (!refetch) {
      return Promise.reject(
        new Error('Cannot refetch before first fetch is done. Fetch first.')
      );
    }
    loadTracker.current.loading = true;
    return refetch();
  }, [refetch]);

  if (loadTracker.current.loading && loading === false && data) {
    loadTracker.current.loading = false;
    loadTracker.current.complete = true;
    updateProfileData(data);
  } else if (!profileData && data && !loading) {
    loadTracker.current.started = true;
    loadTracker.current.complete = true;
    loadTracker.current.loading = false;
    updateProfileData(data);
  }

  const contextData: ProfileContextData = {
    data: profileData,
    updateProfileData,
    loading,
    error,
    addErrorListener,
    fetch: fetchDataIfNotLoaded,
    refetch: refetchDataIfPossible,
    isInitialized: loadTracker.current.started,
    isComplete: loadTracker.current.complete,
    getName: (preferNickOrGivenName = false) => {
      if (!profileData || !profileData.myProfile) {
        return '';
      }
      const verifiedPersonalInformation = getVerifiedPersonalInformation(
        profileData
      );
      if (verifiedPersonalInformation) {
        return `${
          preferNickOrGivenName && verifiedPersonalInformation.givenName
            ? verifiedPersonalInformation.givenName
            : verifiedPersonalInformation.firstName
        } ${verifiedPersonalInformation.lastName}`;
      } else {
        const source = profileData.myProfile;
        return preferNickOrGivenName && source.nickname
          ? source.nickname
          : `${source.firstName} ${source.lastName}`;
      }
    },
    getProfile: () =>
      profileData && profileData.myProfile ? profileData : null,
  };

  return (
    <ProfileContext.Provider value={contextData}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileErrorListener = (listener: ErrorListener): void => {
  const { addErrorListener } = useContext(ProfileContext);

  const rerenderFreeFunc = useMemoizedFn(listener);
  const disposeListener = useMemo(() => addErrorListener(rerenderFreeFunc), [
    addErrorListener,
    rerenderFreeFunc,
  ]);

  useEffect(
    () => () => {
      disposeListener();
    },
    [disposeListener]
  );
};

export const useVerifiedPersonalInformation = () =>
  getVerifiedPersonalInformation(useContext(ProfileContext).data);

export const { Consumer } = ProfileContext;
