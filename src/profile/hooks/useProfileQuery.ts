import { ApolloError, FetchResult, useLazyQuery } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useEffect } from 'react';
import { usePersistFn } from 'ahooks';
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
  note: there is a bug in Apollo client.
  https://github.com/apollographql/apollo-client/issues/5531
  onError is triggered only once, unless notifyOnNetworkStatusChange:true.
  That will cause unnecessary re-renders on every network status change
  so will not use it.
  Work-around: useEffect will trigger onError when error changes.
*/
export function useProfileQuery(props?: {
  onError: (queryError: ApolloError) => void;
}): QueryReturnType {
  const [fetch, { data, error, loading, refetch }] = useLazyQuery<ProfileRoot>(
    MY_PROFILE,
    {
      errorPolicy: 'all',
    }
  );
  const dependencySafeOnError = usePersistFn(
    props && props.onError ? props.onError : _.noop
  );
  useEffect(() => {
    if (error) {
      dependencySafeOnError(error);
    }
  }, [dependencySafeOnError, error]);

  return {
    fetch,
    data,
    error,
    loading,
    refetch,
  };
}
