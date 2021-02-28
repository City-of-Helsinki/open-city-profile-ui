import {
  useMutation,
  useQuery,
  FetchResult,
  Reference,
  ApolloCache,
} from '@apollo/client';
import { ApolloError, NetworkStatus } from 'apollo-boost';
import { loader } from 'graphql.macro';
import { useRef, useState } from 'react';

import {
  UpdateMyProfileVariables,
  UpdateMyProfile as UpdateMyProfileData,
  MyProfileQuery,
  ProfileInput,
  UpdateMyProfile_updateMyProfile_profile as UpdatedMyProfile,
} from '../../graphql/generatedTypes';
import {
  FormValues,
  EditData,
  matchEditDataToProfileData,
  getTargetData,
  collect,
  getData,
  updateProfileDataValue,
  createNewItem,
  setNewPrimary,
  basicDataType,
  additionalInformationType,
} from './mutationEditor';
import { updatePartialMutationVariables } from './updateMutationVariables';

const UPDATE_PROFILE = loader('../../profile/graphql/UpdateMyProfile.graphql');
const MY_PROFILE = loader('../../profile/graphql/MyProfileQuery.graphql');

type AnyObject = Record<string, unknown>;
type UpdateResult = FetchResult<UpdateMyProfileData, AnyObject, AnyObject>;
type QueryResult = FetchResult<MyProfileQuery, AnyObject, AnyObject>;

type UpdateProfile = (
  formValues: Partial<FormValues>,
  profile?: MyProfileQuery
) => {
  promise: Promise<UpdateResult>;
  profileInput: ProfileInput | null;
};

type QueryReturnType = {
  error: ApolloError | undefined;
  loading: boolean;
  data: MyProfileQuery | undefined;
  networkStatus: NetworkStatus;
  refetch: (variables?: AnyObject) => Promise<QueryResult>;
  updateTime: number;
};

type MutationReturnType = {
  error: ApolloError | undefined;
  loading: boolean;
  data: UpdateMyProfileData | undefined | null;
  update: UpdateProfile;
};

type MutationHandlerReturnType = {
  data: EditData[];
  add: () => void;
  save: (item: EditData) => Promise<void>;
  remove: (item: EditData) => Promise<void | UpdateResult>;
  setPrimary: (item: EditData) => Promise<void>;
  loading: boolean;
};

let profileData: QueryReturnType['data'] = undefined;
let profileUpdateTime = 0;

function profileInputFromUpdateMyProfileVariables(
  variables: UpdateMyProfileVariables
): ProfileInput {
  return variables.input.profile;
}

function updateProfileData(data: MyProfileQuery): void {
  profileData = data;
  profileUpdateTime = Date.now();
}

function getCacheUpdateFields(
  dataType: EditData['dataType'],
  updatedProfile: UpdatedMyProfile
): Record<string, (data: unknown) => unknown> {
  if (dataType === 'phones') {
    return getPhoneCacheUpdateFields(updatedProfile);
  }
  if (dataType === 'emails') {
    return getEmailCacheUpdateFields(updatedProfile);
  }
  if (dataType === 'addresses') {
    return getAddressCacheUpdateFields(updatedProfile);
  }
  if (dataType === basicDataType) {
    return getBasicDataCacheUpdateFields(updatedProfile);
  }
  if (dataType === additionalInformationType) {
    return getAdditionalDataCacheUpdateFields(updatedProfile);
  }
  return {};
}

function getPhoneCacheUpdateFields(
  updatedProfile: UpdatedMyProfile
): Record<string, (data: unknown) => unknown> {
  return {
    phones: () => updatedProfile.phones,
    primaryPhone: () => updatedProfile.primaryPhone,
  };
}

function getEmailCacheUpdateFields(
  updatedProfile: UpdatedMyProfile
): Record<string, (data: unknown) => unknown> {
  return {
    emails: () => updatedProfile.emails,
    primaryEmail: () => updatedProfile.primaryEmail,
  };
}

function getAddressCacheUpdateFields(
  updatedProfile: UpdatedMyProfile
): Record<string, (data: unknown) => unknown> {
  return {
    addresses: () => updatedProfile.addresses,
    primaryAddress: () => updatedProfile.primaryAddress,
  };
}

function getBasicDataCacheUpdateFields(
  updatedProfile: UpdatedMyProfile
): Record<string, (data: unknown) => unknown> {
  return {
    firstName: () => updatedProfile.firstName,
    nickname: () => updatedProfile.nickname,
    lastName: () => updatedProfile.lastName,
  };
}

function getAdditionalDataCacheUpdateFields(
  updatedProfile: UpdatedMyProfile
): Record<string, (data: unknown) => unknown> {
  return {
    language: () => updatedProfile.language,
  };
}

function updateCache(
  cache: ApolloCache<UpdateMyProfileData>,
  result: UpdateResult,
  dataType: EditData['dataType']
) {
  const updatedProfile: UpdatedMyProfile | null | undefined =
    result.data?.updateMyProfile?.profile;
  const identity =
    profileData &&
    cache.identify((profileData.myProfile as unknown) as Reference);
  if (!updatedProfile || !identity) {
    throw new Error('Unable to update cache');
  }
  cache.modify({
    id: identity,
    fields: getCacheUpdateFields(dataType, updatedProfile),
  });
  const newData = cache.readQuery({
    query: MY_PROFILE,
  });
  updateProfileData(newData as MyProfileQuery);
}

export function useProfileQuery(props?: {
  onError: (queryError: ApolloError) => void;
}): QueryReturnType {
  const { refetch, data, error, loading, networkStatus } = useQuery<
    MyProfileQuery
  >(MY_PROFILE, {
    onError: (queryError: ApolloError) => {
      if (props && props.onError) {
        props.onError(queryError);
      }
    },
    errorPolicy: 'all',
  });
  const loadStateTracker = useRef({ isLoading: loading });
  const loadStarted = loadStateTracker.current.isLoading;
  if (loadStarted && loading === false && data) {
    updateProfileData(data);
    loadStateTracker.current.isLoading = false;
  } else if (!loadStarted && loading) {
    loadStateTracker.current.isLoading = true;
  }
  if (!profileData && data && !loading) {
    updateProfileData(data);
  }
  return {
    refetch,
    data: profileData, // prevents bug(?) when network status changes, but data is old
    error,
    loading,
    networkStatus,
    updateTime: profileUpdateTime,
  };
}

export function useProfileMutation({
  dataType,
}: {
  dataType: EditData['dataType'];
}): MutationReturnType {
  const [updateProfile, { error, loading, data }] = useMutation<
    UpdateMyProfileData,
    UpdateMyProfileVariables
  >(UPDATE_PROFILE, {
    update: (cache, result) => updateCache(cache, result, dataType),
  });

  const update: UpdateProfile = (formValues, profile) => {
    const currentProfile = profile || profileData;
    if (!currentProfile) {
      return {
        promise: Promise.reject({ error: 'No profile data' }),
        profileInput: null,
      };
    }
    const variables = updatePartialMutationVariables(
      formValues,
      currentProfile
    );
    return {
      promise: updateProfile({ variables }),
      profileInput: profileInputFromUpdateMyProfileVariables(variables),
    };
  };

  return { update, error, loading, data };
}

export function useProfileMutationHandler({
  dataType,
}: {
  dataType: EditData['dataType'];
}): MutationHandlerReturnType {
  const { data, updateTime } = useProfileQuery();
  const { update: mutationUpdate } = useProfileMutation({
    dataType,
  });
  const [currentData, updateData] = useState<EditData[]>(() =>
    getData(data, dataType)
  );
  const loadStateTracker = useRef({ updateTime: data ? updateTime : 0 });
  if (
    loadStateTracker.current.updateTime < updateTime &&
    data &&
    data.myProfile
  ) {
    const matchResult = matchEditDataToProfileData(
      currentData,
      getTargetData(data, dataType),
      dataType
    );
    loadStateTracker.current.updateTime = Date.now();
    if (matchResult.hasChanged) {
      updateData(matchResult.items);
    }
  }
  const update = (current: EditData[]) => {
    const formValues = collect(current, dataType);
    const { promise, profileInput } = mutationUpdate(formValues, data);
    return { promise, profileInput };
  };

  const add = () => {
    const newItem = createNewItem(dataType);
    updateData([...currentData, newItem]);
  };
  const save = async (item: EditData) => {
    updateProfileDataValue(item);
    await update(currentData).promise;
    return Promise.resolve();
  };
  const remove = async (item: EditData) => {
    const isNew = !item.profileData.id;
    if (isNew) {
      const index = currentData.findIndex(
        dataItem => dataItem.status === 'new'
      );
      if (index === -1) {
        return Promise.resolve();
      }
      currentData.splice(index, 1);
      updateData([...currentData]);
      return Promise.resolve();
    } else {
      item.status = 'removed';
      return update(currentData).promise;
    }
  };
  const setPrimary = async (item: EditData) => {
    const newData = setNewPrimary(currentData, item);
    if (newData) {
      await update(newData).promise;
    }
    return Promise.resolve();
  };

  return {
    data: currentData,
    add,
    loading: !data,
    save,
    remove,
    setPrimary,
  };
}
