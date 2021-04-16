import {
  useMutation,
  FetchResult,
  Reference,
  ApolloCache,
} from '@apollo/client';
import { loader } from 'graphql.macro';
import { useContext } from 'react';
import { Modifiers } from '@apollo/client/cache/core/types/common';

import { UpdateMyProfileVariables } from '../../graphql/generatedTypes';
import {
  ProfileRoot,
  UpdateProfileRoot,
  UpdateProfileData,
  AnyObject,
} from '../../graphql/typings';
import {
  FormValues,
  EditDataType,
  basicDataType,
  additionalInformationType,
} from '../helpers/editData';
import { updateMutationVariables } from '../helpers/updateMutationVariables';
import { ProfileContext, ProfileContextData } from '../context/ProfileContext';

const UPDATE_PROFILE = loader('../../profile/graphql/UpdateMyProfile.graphql');
const MY_PROFILE = loader('../../profile/graphql/MyProfileQuery.graphql');

export type QueryResult = FetchResult<ProfileRoot, AnyObject, AnyObject>;
export type UpdateResult = FetchResult<UpdateProfileRoot>;

type UpdateProfileFunction = (
  formValues: Partial<FormValues>,
  profile?: ProfileRoot
) => Promise<UpdateResult>;

export type MutationReturnType = {
  profileData?: ProfileRoot;
  update: UpdateProfileFunction;
};

type UpdatableProfileDataKeys = keyof Omit<
  UpdateProfileData,
  '__typename' | 'id'
>;

type ValuesOfUpdateProfileData = UpdateProfileData[UpdatableProfileDataKeys];

type CacheUpdateFunction = (
  data?: UpdateProfileData
) => ValuesOfUpdateProfileData;

type CacheUpdateProps = Partial<
  Record<UpdatableProfileDataKeys, CacheUpdateFunction>
>;

// cache is updated with cache.modify({fields...})
// where properties of the "fields" object are fields to update
// the format is: {"property": <function returning new value>}
// example: fields:{ phones:()=>listOfPhones, primaryPhone:()=>newPrimaryPhone}
// this helper function creates those objects from listed "fields"
// and returns same field from given data source "updatedProfile"
function updateFieldCreator(
  fields: UpdatableProfileDataKeys[],
  updatedProfile: UpdateProfileData
): CacheUpdateProps {
  return fields.reduce((currentValue, nextField) => {
    currentValue[nextField] = () => updatedProfile[nextField];
    return currentValue;
  }, {} as CacheUpdateProps);
}

function getCacheUpdateFields(
  dataType: EditDataType,
  updatedProfile: UpdateProfileData
): CacheUpdateProps {
  const fields: UpdatableProfileDataKeys[] = [];
  if (dataType === 'phones') {
    fields.push(dataType, 'primaryPhone');
  } else if (dataType === 'emails') {
    fields.push(dataType, 'primaryEmail');
  } else if (dataType === 'addresses') {
    fields.push(dataType, 'primaryAddress');
  } else if (dataType === basicDataType) {
    fields.push('firstName', 'nickname', 'lastName');
  } else if (dataType === additionalInformationType) {
    fields.push('language');
  }
  return updateFieldCreator(fields, updatedProfile);
}

function updateCache(
  cache: ApolloCache<UpdateProfileRoot>,
  result: UpdateResult,
  dataType: EditDataType,
  profileData: ProfileRoot | null | undefined,
  updateProfileData: ProfileContextData['updateProfileData']
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
    fields: getCacheUpdateFields(dataType, updatedProfile) as Modifiers,
  });
  const newData = cache.readQuery({
    query: MY_PROFILE,
  });
  updateProfileData(newData as ProfileRoot);
}

export function useProfileMutations({
  dataType,
}: {
  dataType: EditDataType;
}): MutationReturnType {
  const { data: profileData, updateProfileData } = useContext(ProfileContext);
  const [updateProfile] = useMutation<
    UpdateProfileRoot,
    UpdateMyProfileVariables
  >(UPDATE_PROFILE, {
    update: (cache, result) =>
      updateCache(cache, result, dataType, profileData, updateProfileData),
  });

  const update: UpdateProfileFunction = (formValues, profile) => {
    const currentProfile = profile || profileData;
    if (!currentProfile) {
      return Promise.reject({ error: 'No profile data' });
    }
    const variables = updateMutationVariables(formValues, currentProfile);
    return updateProfile({ variables });
  };

  return { update, profileData };
}
