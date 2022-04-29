import { ApolloError, FetchResult, useLazyQuery } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useEffect, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';
import _ from 'lodash';

import { ProfileRoot } from '../../graphql/typings';

const MY_PROFILE = loader('../graphql/MyProfileQuery.graphql');

export type QueryResult = FetchResult<ProfileRoot>;

type QueryReturnType = {
  error: ApolloError | undefined;
  loading: boolean;
  data: ProfileRoot | undefined;
  fetch: () => void;
  refetch?: () => Promise<QueryResult>;
};

/*
  note:
  onError is not triggered when errorPolicy === 'all'
  If user is logged in with weak authentication, there is always a graphQL error included.
  If errorPolicy is 'none', graphQL errors are not allowed. Profile won't load.
  If errorPolicy is 'ignore', graphQL errors are not populated and cannot be detected.
  Work-around: useEffect will trigger onError when error changes.
*/
export function useProfileQuery(props?: {
  onError: (queryError: ApolloError) => void;
}): QueryReturnType {
  const errorToTriggerRef = useRef<ApolloError | undefined>(undefined);
  const storeTriggeredError = (newRef: ApolloError | undefined) => {
    errorToTriggerRef.current = newRef;
  };
  const [fetch, { data, error, loading, refetch }] = useLazyQuery<ProfileRoot>(
    MY_PROFILE,
    {
      errorPolicy: 'all',
    }
  );
  const dependencySafeOnError = useMemoizedFn(
    props && props.onError ? props.onError : _.noop
  );
  useEffect(() => {
    if (!errorToTriggerRef.current && error) {
      dependencySafeOnError(error);
      storeTriggeredError(error);
    }
  }, [dependencySafeOnError, error]);

  return {
    fetch: () => {
      storeTriggeredError(undefined);
      return fetch();
    },
    data,
    error,
    loading,
    refetch: () => {
      storeTriggeredError(undefined);
      return refetch();
    },
  };
}
