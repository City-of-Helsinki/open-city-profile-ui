import { useCallback, useContext, useEffect, useRef } from 'react';

import { ProfileContext, ProfileContextData } from '../context/ProfileContext';
import parseGraphQLError from '../helpers/parseGraphQLError';
import { QueryResult } from './useProfileQuery';

const STATUS_FAILED = -1;
const STATUS_WAITING = 0;
const STATUS_SHOULD_LOAD = 1;
const STATUS_LOADING = 2;
const STATUS_SUCCESS = 3;

type Status =
  | typeof STATUS_WAITING
  | typeof STATUS_LOADING
  | typeof STATUS_FAILED
  | typeof STATUS_SUCCESS
  | typeof STATUS_SHOULD_LOAD;

export type useProfileLoaderHookReturnType = {
  isProfileLoadComplete: () => boolean;
  hasExistingProfile: () => boolean;
  didProfileLoadFail: () => boolean;
  reloadProfile: () => Promise<QueryResult>;
};

function shouldLoad(currentStatus?: Status): boolean {
  return currentStatus === STATUS_SHOULD_LOAD;
}

function isLoading(currentStatus?: Status): boolean {
  return currentStatus === STATUS_LOADING;
}

function didLoadFail(currentStatus?: Status): boolean {
  return currentStatus === STATUS_FAILED;
}

function isLoadedSuccessfully(currentStatus?: Status): boolean {
  return currentStatus === STATUS_SUCCESS;
}

function isLoadComplete(currentStatus?: Status): boolean {
  return didLoadFail(currentStatus) || isLoadedSuccessfully(currentStatus);
}

function canStartLoading(currentStatus?: Status): boolean {
  return !isLoading(currentStatus) && !isLoadComplete(currentStatus);
}

function resolveChangedStatus(
  currentStatus: Status,
  profileContext: ProfileContextData
): Status | undefined {
  if (isLoadComplete(currentStatus)) {
    return undefined;
  }

  if (
    profileContext.error &&
    !parseGraphQLError(profileContext.error).isAllowedError
  ) {
    return STATUS_FAILED;
  }

  if (profileContext.data && !isLoadedSuccessfully(currentStatus)) {
    return STATUS_SUCCESS;
  }

  if (canStartLoading(currentStatus) && !shouldLoad(currentStatus)) {
    return STATUS_SHOULD_LOAD;
  }

  return undefined;
}

export function useProfileLoadTracker(): useProfileLoaderHookReturnType {
  const profileContext = useContext(ProfileContext);
  const statusRef = useRef<Status>(STATUS_WAITING);

  const updateStatus = useCallback((updatedStatus?: Status): Status => {
    console.log('Updating status to', updatedStatus);

    if (!updatedStatus) {
      return statusRef.current;
    }
    statusRef.current = updatedStatus;
    return statusRef.current;
  }, []);

  const newStatus = resolveChangedStatus(statusRef.current, profileContext);

  updateStatus(newStatus);

  useEffect(() => {
    console.log('Effect running with newStatus', newStatus);
    if (shouldLoad(newStatus)) {
      console.log('Starting to load');
      updateStatus(STATUS_LOADING);
      profileContext.fetch();
    }
  }, [newStatus, updateStatus, profileContext]);

  return {
    isProfileLoadComplete: () => isLoadComplete(statusRef.current),
    didProfileLoadFail: () => didLoadFail(statusRef.current),
    hasExistingProfile: () => {
      if (!isLoadComplete(statusRef.current)) {
        throw new Error(
          'hasExistingProfile cannot be used before profile load is complete. Check it with isProfileLoadComplete()'
        );
      }
      return !!profileContext.getProfile();
    },
    reloadProfile: () => {
      updateStatus(STATUS_LOADING);
      return profileContext.refetch();
    },
  };
}
