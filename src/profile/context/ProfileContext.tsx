import { ApolloError } from '@apollo/client';
import React, { createContext, useCallback, useRef, useState } from 'react';

import { ProfileRoot } from '../../graphql/typings';
import { useProfileQuery, QueryResult } from '../hooks/useProfileQuery';

type ContextProps = {
  children: React.ReactNode | React.ReactNode[] | null;
};

export type ProfileContextData = {
  data?: ProfileRoot;
  updateProfileData: (data: ProfileRoot) => void;
  error?: ApolloError | Error;
  loading: boolean;
  fetch: () => void;
  refetch: () => Promise<QueryResult>;
  isInitialized: boolean;
  isComplete: boolean;
};

export const ProfileContext = createContext<ProfileContextData>({
  data: undefined,
  updateProfileData: () => undefined,
  loading: false,
  fetch: () => {
    throw new Error('Use context provider to initialize ProfileContext');
  },
  refetch: () => Promise.reject(),
  isInitialized: false,
  isComplete: false,
});

export const Provider = (props: ContextProps): React.ReactElement => {
  const { children } = props;
  const { data, loading, error, fetch, refetch } = useProfileQuery();
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
    fetch: fetchDataIfNotLoaded,
    refetch: refetchDataIfPossible,
    isInitialized: loadTracker.current.started,
    isComplete: loadTracker.current.complete,
  };

  return (
    <ProfileContext.Provider value={contextData}>
      {children}
    </ProfileContext.Provider>
  );
};

export const { Consumer } = ProfileContext;
