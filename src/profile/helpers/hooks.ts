import { ExecutionResult } from '@apollo/react-common';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { ApolloError, ApolloQueryResult, NetworkStatus } from 'apollo-boost';
import { loader } from 'graphql.macro';
import { useRef, useState } from 'react';

import {
  UpdateMyProfileVariables,
  UpdateMyProfile as UpdateMyProfileData,
  MyProfileQuery,
  ProfileInput,
} from '../../graphql/generatedTypes';
import {
  FormValues,
  EditData,
  matchEditDataToProfileData,
  getTargetData,
  collect,
  convertUpdateMyProfileDataToMyProfile,
  getData,
  updateProfileDataValue,
  createNewItem,
  UpdateResult,
  setNewPrimary,
} from './mutationEditor';
import { updatePartialMutationVariables } from './updateMutationVariables';

const UPDATE_PROFILE = loader('../../profile/graphql/UpdateMyProfile.graphql');
const MY_PROFILE = loader('../../profile/graphql/MyProfileQuery.graphql');

type UpdateProfile = (
  formValues: Partial<FormValues>,
  profile?: MyProfileQuery
) => {
  promise: Promise<ExecutionResult<UpdateMyProfileData>>;
  profileInput: ProfileInput | null;
};

type QueryReturnType = {
  error: ApolloError | undefined;
  loading: boolean;
  data: MyProfileQuery | undefined;
  networkStatus: NetworkStatus;
  refetch: (
    variables?: Record<string, unknown>
  ) => Promise<ApolloQueryResult<MyProfileQuery>>;
  updateTime: number;
};

type MutationReturnType = {
  error: ApolloError | undefined;
  loading: boolean;
  data: UpdateMyProfileData | undefined;
  update: UpdateProfile;
};

type MutationHandlerReturnType = {
  update: () => {
    promise: Promise<ExecutionResult<UpdateMyProfileData>>;
    profileInput: ProfileInput | null;
  };
  data: EditData[];
  add: () => void;
  save: (item: EditData) => Promise<void>;
  remove: (item: EditData) => Promise<UpdateResult>;
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
  if (loadStarted && loading === false) {
    profileUpdateTime = Date.now();
    profileData = data;
    loadStateTracker.current.isLoading = false;
  } else if (!loadStarted && loading) {
    loadStateTracker.current.isLoading = true;
  }
  if (!profileData && data && !loading) {
    profileData = data;
    profileUpdateTime = Date.now();
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

export function useProfileMutation(): MutationReturnType {
  const [updateProfile, { error, loading, data }] = useMutation<
    UpdateMyProfileData,
    UpdateMyProfileVariables
  >(UPDATE_PROFILE);

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
  const { update: mutationUpdate } = useProfileMutation();
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
  const update = () => {
    const formValues = collect(currentData, dataType);
    const { promise, profileInput } = mutationUpdate(formValues, data);
    promise
      .then((result: ExecutionResult<UpdateMyProfileData>) => {
        const updatedData = convertUpdateMyProfileDataToMyProfile(result.data);
        if (updatedData) {
          const matchResult = matchEditDataToProfileData(
            currentData,
            getTargetData(updatedData, dataType),
            dataType
          );
          loadStateTracker.current.updateTime = Date.now();
          if (matchResult.hasChanged) {
            updateData(matchResult.items);
          }
        }
      })
      .catch(e => false);
    return { promise, profileInput };
  };

  const add = () => {
    const newItem = createNewItem(dataType);
    updateData([...currentData, newItem]);
  };
  const save = async (item: EditData) => {
    updateProfileDataValue(item);
    await update().promise;
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
      return update().promise;
    }
  };
  const setPrimary = async (item: EditData) => {
    const newData = setNewPrimary(currentData, item);
    if (newData) {
      updateData(newData);
      await update().promise;
    }
    return Promise.resolve();
  };

  return {
    update,
    data: currentData,
    add,
    loading: !data,
    save,
    remove,
    setPrimary,
  };
}
