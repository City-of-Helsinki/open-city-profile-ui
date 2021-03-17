import {
  useMutation,
  FetchResult,
  Reference,
  ApolloCache,
  useLazyQuery,
  ApolloError,
  NetworkStatus,
} from '@apollo/client';
import { loader } from 'graphql.macro';
import { useContext, useRef, useState } from 'react';

import { UpdateMyProfileVariables } from '../../graphql/generatedTypes';
import {
  ProfileRoot,
  UpdateProfileRoot,
  UpdateProfileData,
  ProfileInput,
} from '../../graphql/typings';
import {
  FormValues,
  EditData,
  mergeOldEditDataToNewProfileData,
  pickProfileData,
  collectProfileData,
  createEditData,
  updateProfileDataFromEditData,
  createNewEditItem,
  setNewPrimary,
  basicDataType,
  additionalInformationType,
  isNew,
  UpdateResult,
  cloneDataAndGetCurrentClone,
  findEditItemIndex,
} from './mutationEditor';
import { updatePartialMutationVariables } from './updateMutationVariables';
import {
  ProfileContext,
  ProfileContextData,
} from '../../profile/components/context/ProfileContext';
import to from '../../common/awaitTo';

const UPDATE_PROFILE = loader('../../profile/graphql/UpdateMyProfile.graphql');
const MY_PROFILE = loader('../../profile/graphql/MyProfileQuery.graphql');

type AnyObject = Record<string, unknown>;
export type QueryResult = FetchResult<ProfileRoot, AnyObject, AnyObject>;

type UpdateProfile = (
  formValues: Partial<FormValues>,
  profile?: ProfileRoot
) => {
  promise: Promise<UpdateResult>;
  profileInput: ProfileInput | null;
};

type QueryReturnType = {
  error: ApolloError | undefined;
  loading: boolean;
  data: ProfileRoot | undefined;
  networkStatus: NetworkStatus;
  fetch: () => void;
  refetch?: () => Promise<QueryResult>;
};

type MutationReturnType = {
  error: ApolloError | undefined;
  loading: boolean;
  data: UpdateProfileRoot | undefined | null;
  update: UpdateProfile;
};

type MutationHandlerReturnType = {
  data: EditData[];
  add: () => void;
  save: (item: EditData) => Promise<UpdateResult>;
  remove: (item: EditData) => Promise<void | UpdateResult>;
  setPrimary: (item: EditData) => Promise<void>;
  loading: boolean;
};

function profileInputFromUpdateMyProfileVariables(
  variables: UpdateMyProfileVariables
): ProfileInput {
  return variables.input.profile;
}

function getCacheUpdateFields(
  dataType: EditData['dataType'],
  updatedProfile: UpdateProfileData
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
  updatedProfile: UpdateProfileData
): Record<string, (data: unknown) => unknown> {
  return {
    phones: () => updatedProfile.phones,
    primaryPhone: () => updatedProfile.primaryPhone,
  };
}

function getEmailCacheUpdateFields(
  updatedProfile: UpdateProfileData
): Record<string, (data: unknown) => unknown> {
  return {
    emails: () => updatedProfile.emails,
    primaryEmail: () => updatedProfile.primaryEmail,
  };
}

function getAddressCacheUpdateFields(
  updatedProfile: UpdateProfileData
): Record<string, (data: unknown) => unknown> {
  return {
    addresses: () => updatedProfile.addresses,
    primaryAddress: () => updatedProfile.primaryAddress,
  };
}

function getBasicDataCacheUpdateFields(
  updatedProfile: UpdateProfileData
): Record<string, (data: unknown) => unknown> {
  return {
    firstName: () => updatedProfile.firstName,
    nickname: () => updatedProfile.nickname,
    lastName: () => updatedProfile.lastName,
  };
}

function getAdditionalDataCacheUpdateFields(
  updatedProfile: UpdateProfileData
): Record<string, (data: unknown) => unknown> {
  return {
    language: () => updatedProfile.language,
  };
}

function updateCache(
  cache: ApolloCache<UpdateProfileRoot>,
  result: UpdateResult,
  dataType: EditData['dataType'],
  profileData: ProfileRoot | null | undefined,
  updateProfileData: ProfileContextData['updateProfileContext']
) {
  const updatedProfile: UpdateProfileData | null | undefined =
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
  updateProfileData(newData as ProfileRoot);
}

export function useProfileQuery(props?: {
  onError: (queryError: ApolloError) => void;
}): QueryReturnType {
  const [
    fetch,
    { data, error, loading, networkStatus, refetch },
  ] = useLazyQuery<ProfileRoot>(MY_PROFILE, {
    onError: (queryError: ApolloError) => {
      if (props && props.onError) {
        props.onError(queryError);
      }
    },
    errorPolicy: 'all',
  });

  return {
    fetch,
    data,
    error,
    loading,
    networkStatus,
    refetch,
  };
}

export function useProfileMutation({
  dataType,
}: {
  dataType: EditData['dataType'];
}): MutationReturnType {
  const { data: profileData, updateProfileContext } = useContext(
    ProfileContext
  );
  const [updateProfile, { error, loading, data }] = useMutation<
    UpdateProfileRoot,
    UpdateMyProfileVariables
  >(UPDATE_PROFILE, {
    update: (cache, result) =>
      updateCache(cache, result, dataType, profileData, updateProfileContext),
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
  const { data, updateTime } = useContext(ProfileContext);
  const { update: mutationUpdate } = useProfileMutation({
    dataType,
  });
  const [currentData, updateData] = useState<EditData[]>(() =>
    createEditData(data, dataType)
  );
  const loadStateTracker = useRef({ updateTime: data ? updateTime : 0 });
  if (
    loadStateTracker.current.updateTime < updateTime &&
    data &&
    data.myProfile
  ) {
    const matchResult = mergeOldEditDataToNewProfileData(
      currentData,
      pickProfileData(data, dataType),
      dataType
    );
    loadStateTracker.current.updateTime = Date.now();
    if (matchResult.hasChanged) {
      updateData(matchResult.items);
    }
  }

  const executeMutationUpdate = (current: EditData[]) => {
    const formValues = collectProfileData(current, dataType);
    const { promise, profileInput } = mutationUpdate(
      formValues,
      data as ProfileRoot
    );
    return { promise, profileInput };
  };

  const executeMutationUpdateAndHandleResult = async (newData: EditData[]) => {
    const [err, success] = await to(executeMutationUpdate(newData).promise);
    if (err) {
      return Promise.reject(err);
    }
    return Promise.resolve(success);
  };

  const add = () => {
    const newItem = createNewEditItem(dataType);
    updateData([...currentData, newItem]);
  };

  const save = async (item: EditData) => {
    const { clonedData, clonedItem } = cloneDataAndGetCurrentClone(
      currentData,
      item
    );
    updateProfileDataFromEditData(clonedItem);
    return executeMutationUpdateAndHandleResult(clonedData);
  };

  const remove = async (item: EditData) => {
    if (isNew(item)) {
      const index = currentData.findIndex(dataItem => isNew(dataItem));
      if (index === -1) {
        return Promise.resolve();
      }
      currentData.splice(index, 1);
      updateData([...currentData]);
      return Promise.resolve();
    } else {
      const { clonedData, clonedItem } = cloneDataAndGetCurrentClone(
        currentData,
        item
      );
      const index = findEditItemIndex(clonedData, clonedItem);
      clonedData.splice(index, 1);
      return executeMutationUpdateAndHandleResult(clonedData);
    }
  };

  const setPrimary = async (item: EditData) => {
    const newData = setNewPrimary(currentData, item);
    if (newData) {
      return executeMutationUpdateAndHandleResult(newData);
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
