import { MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import { loader } from 'graphql.macro';
import _ from 'lodash';

import {
  ProfileInput,
  Language,
  ProfileRoot,
  ProfileData,
  UpdateProfileRoot,
  UpdateProfileData,
  AddressNode,
  MutableAddresses,
  InsertableNode,
  EdgeList,
  MutableEmails,
  MutablePhones,
} from '../../graphql/typings';
import {
  Action,
  additionalInformationType,
  basicDataType,
  createEditData,
  createEditDataValueFromProfileData,
  createEditItem,
  EditableAdditionalInformation,
  EditableAddress,
  EditableUserData,
  EditData,
  FormValues,
  Mutable,
  pickProfileData,
} from '../../profile/helpers/mutationEditor';
import { updatePartialMutationVariables } from '../../profile/helpers/updateMutationVariables';
import {
  collectAllNodes,
  findAndUpdateAddressEdgesNode,
  getMyProfile,
  removeAddress,
  getCreatorFunc,
  findNodeById,
  getAddFunc,
  setAsPrimary,
  createId,
  getEdges,
  findAndUpdateEmailEdgesNode,
  findAndUpdatePhoneEdgesNode,
  removePhone,
  removeEmail,
  cloneObject,
} from './myProfileMocking';

const QUERY_UPDATE_MY_PROFILE = loader(
  '../../profile/graphql/UpdateMyProfile.graphql'
);
const QUERY_MY_PROFILE = loader('../../profile/graphql/MyProfileQuery.graphql');

type Change = {
  action: Action | 'error';
  id: string;
};

type TestData = {
  mocks: MockedResponse[];
  modifiedEditData: (EditData | null)[];
};

export const createMockedMyProfileResponse = (
  resultData: ProfileRoot
): MockedResponse => ({
  request: {
    query: QUERY_MY_PROFILE,
    variables: {},
  },
  result: {
    data: resultData,
  },
});

export const createMockedUpdateProfileResponse = (
  resultData: UpdateProfileRoot,
  queryVariables: ProfileInput,
  errorType?: 'networkError' | 'graphQLError'
): MockedResponse => {
  const content = !errorType
    ? {
        result: {
          data: resultData,
        },
      }
    : errorType === 'networkError'
    ? { error: new Error('Network error') }
    : {
        result: {
          errors: [new GraphQLError('Error!')],
        },
      };
  return {
    request: {
      query: QUERY_UPDATE_MY_PROFILE,
      variables: {
        input: {
          profile: queryVariables,
        },
      },
    },
    ...content,
  };
};

export const updateProfileQueryData = (
  profileData: ProfileRoot,
  newProfileData: Partial<UpdateProfileData>,
  returnUpdateGraph: boolean
): ProfileRoot | UpdateProfileRoot => {
  const currentProfile = profileData.myProfile as ProfileData;
  if (returnUpdateGraph) {
    return {
      updateMyProfile: {
        profile: {
          ...currentProfile,
          ...newProfileData,
          __typename: 'ProfileNode',
        },
        __typename: 'UpdateMyProfileMutationPayload',
      },
    } as UpdateProfileRoot;
  }
  return {
    myProfile: {
      ...currentProfile,
      ...newProfileData,
      __typename: 'ProfileWithVerifiedPersonalInformationNode',
    },
  } as ProfileRoot;
};

export const createUpdateResponse = (
  profileData: ProfileRoot,
  newProfileData: Partial<UpdateProfileData>,
  queryVariables: ProfileInput,
  errorType?: 'networkError' | 'graphQLError'
): MockedResponse => {
  const currentProfile = profileData.myProfile as ProfileData;
  const data: UpdateProfileRoot = {
    // change
    updateMyProfile: {
      profile: {
        ...currentProfile,
        ...newProfileData,
        __typename: 'ProfileNode',
      },
      __typename: 'UpdateMyProfileMutationPayload',
    },
  };
  return createMockedUpdateProfileResponse(data, queryVariables, errorType);
};

function createAddressUpdate(
  profileData: ProfileData,
  editData?: EditData
): Partial<UpdateProfileData> {
  const list = collectAllNodes(profileData, 'addresses') as MutableAddresses;
  if (editData) {
    findAndUpdateAddressEdgesNode(
      list,
      editData.profileData.id,
      editData.value as Partial<AddressNode>
    );
  }
  const primaryIndex = list.edges.findIndex(
    edge => edge?.node?.primary === true
  );
  const primaryAddress =
    primaryIndex > -1 ? list.edges.splice(primaryIndex, 1)[0] : null;
  return {
    primaryAddress: (primaryAddress && primaryAddress.node) || null,
    addresses: list,
  };
}

function createEmailsUpdate(
  profileData: ProfileData,
  editData?: EditData
): Partial<UpdateProfileData> {
  const list = collectAllNodes(profileData, 'emails') as MutableEmails;
  if (editData) {
    findAndUpdateEmailEdgesNode(list, editData.profileData.id, {
      email: editData.value as string,
    });
  }
  const primaryIndex = list.edges.findIndex(
    edge => edge?.node?.primary === true
  );
  const primaryEmail =
    primaryIndex > -1 ? list.edges.splice(primaryIndex, 1)[0] : null;
  return {
    primaryEmail: (primaryEmail && primaryEmail.node) || null,
    emails: list,
  };
}

function createPhonesUpdate(
  profileData: ProfileData,
  editData?: EditData
): Partial<UpdateProfileData> {
  const list = collectAllNodes(profileData, 'phones') as MutablePhones;
  if (editData) {
    findAndUpdatePhoneEdgesNode(list, editData.profileData.id, {
      phone: editData.value as string,
    });
  }
  const primaryIndex = list.edges.findIndex(
    edge => edge?.node?.primary === true
  );
  const primaryPhone =
    primaryIndex > -1 ? list.edges.splice(primaryIndex, 1)[0] : null;
  return {
    primaryPhone: (primaryPhone && primaryPhone.node) || null,
    phones: list,
  };
}

export function getUpdateCreatorFunc(
  dataType: EditData['dataType']
): (
  profileData: ProfileData,
  editData?: EditData
) => Partial<UpdateProfileData> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return dataType === 'addresses'
    ? createAddressUpdate
    : dataType === 'phones'
    ? createPhonesUpdate
    : createEmailsUpdate;
}

export function getRemoverFunc(
  dataType: EditData['dataType']
): (profileData: ProfileData, id: string) => boolean {
  return dataType === 'addresses'
    ? removeAddress
    : dataType === 'phones'
    ? removePhone
    : removeEmail;
}

function createEditDataWithNode(
  dataType: EditData['dataType'],
  node: InsertableNode
): EditData {
  const creator = getCreatorFunc(dataType);
  const newProfileData = creator() as EditData['profileData'];
  if (dataType !== basicDataType) {
    (newProfileData as Mutable<InsertableNode>).primary = node.primary;
  }
  const editData = createEditItem(dataType, node);
  editData.value = createEditDataValueFromProfileData(newProfileData, dataType);
  return editData;
}

export function createMutationMocksAndTestData(
  dataType: EditData['dataType'],
  changes: Change[]
): TestData {
  const mocks: TestData['mocks'] = [
    createMockedMyProfileResponse(getMyProfile()),
  ];
  const modifiedEditData: TestData['modifiedEditData'] = [];
  const currentProfile = getMyProfile();

  changes.forEach(({ action, id }) => {
    const nextProfile = cloneObject(currentProfile);
    const nextProfileData = nextProfile.myProfile as ProfileData;
    const target = findNodeById(nextProfileData, dataType, id);
    if (id && !target) {
      throw new Error(`Edit target not found`);
    }

    const createResponse = (
      updatedData: Partial<UpdateProfileData>,
      errorType?: 'networkError' | 'graphQLError'
    ): MockedResponse => {
      const updatedNextProfile = updateProfileQueryData(
        nextProfile,
        updatedData,
        false
      ) as ProfileRoot;

      const nextVersionNodes = pickProfileData(
        updatedNextProfile,
        dataType
      ) as InsertableNode[];

      const mutationData =
        dataType === basicDataType || dataType === additionalInformationType
          ? (updatedData as Partial<FormValues>)
          : { [dataType]: nextVersionNodes };

      const profileChanges = updatePartialMutationVariables(
        mutationData,
        currentProfile
      );
      const hasNewArray =
        profileChanges.input.profile.addAddresses ||
        profileChanges.input.profile.addEmails ||
        profileChanges.input.profile.addPhones;
      if (hasNewArray && hasNewArray.length) {
        const edges = getEdges(
          (updatedData as unknown) as ProfileData,
          dataType
        ) as EdgeList;
        const lastEdge = edges[edges.length - 1];
        const newEdgeNode = lastEdge ? lastEdge.node : null;

        if (newEdgeNode) {
          (newEdgeNode as Mutable<InsertableNode>).id = createId();
        }
      }
      const updateResponse = createUpdateResponse(
        currentProfile,
        updatedData,
        profileChanges.input.profile,
        errorType
      );
      if (!errorType) {
        (currentProfile as Mutable<ProfileRoot>).myProfile = _.get(
          updateResponse.result,
          'data.updateMyProfile.profile'
        );
      }
      mocks.push(updateResponse);
      return updateResponse;
    };

    if (action === 'edit') {
      if (dataType === basicDataType) {
        const basicEditData = createEditData(nextProfile, dataType)[0];

        const value = basicEditData.value as EditableUserData;
        (basicEditData.value as EditableUserData) = {
          firstName: `${value.firstName}-a`,
          nickname: `${value.nickname}-b`,
          lastName: `${value.lastName}-c`,
        };

        createResponse(basicEditData.value as EditableUserData);
        modifiedEditData.push(basicEditData);
      } else if (dataType === additionalInformationType) {
        const basicEditData = createEditData(nextProfile, dataType)[0];

        const value = basicEditData.value as EditableAdditionalInformation;
        value.profileLanguage = Language.SWEDISH;

        createResponse(basicEditData.value as EditableAdditionalInformation);
        modifiedEditData.push(basicEditData);
      } else {
        const editDataM = createEditDataWithNode(
          dataType,
          target as InsertableNode
        );
        const updateCreator = getUpdateCreatorFunc(dataType);
        const update = updateCreator(nextProfileData, editDataM);
        createResponse(update);
        modifiedEditData.push(editDataM);
      }
    } else if (action === 'set-primary') {
      const editDataP = createEditItem(dataType, target as InsertableNode);
      setAsPrimary(nextProfileData, editDataP, dataType);
      if (dataType === 'addresses') {
        (editDataP.value as EditableAddress).primary = true;
      }
      const updateCreator = getUpdateCreatorFunc(dataType);
      const update = updateCreator(nextProfileData, editDataP);
      createResponse(update);
      modifiedEditData.push(editDataP);
    } else if (action === 'remove') {
      const removeFunc = getRemoverFunc(dataType);
      removeFunc(nextProfileData, id);
      const updateCreator = getUpdateCreatorFunc(dataType);
      const update = updateCreator(nextProfileData);
      createResponse(update);
      modifiedEditData.push(null);
    } else if (action === 'error') {
      if (dataType === basicDataType) {
        const basicEditDataErr = createEditData(nextProfile, dataType)[0];
        createResponse(
          basicEditDataErr.value as EditableUserData,
          'graphQLError'
        );
        modifiedEditData.push(basicEditDataErr);
      } else if (dataType === additionalInformationType) {
        const basicEditDataErr = createEditData(nextProfile, dataType)[0];
        const value = basicEditDataErr.value as EditableAdditionalInformation;
        value.profileLanguage = Language.ENGLISH;
        createResponse(
          basicEditDataErr.value as EditableAdditionalInformation,
          'graphQLError'
        );
        modifiedEditData.push(basicEditDataErr);
      } else {
        const editDataErr = createEditDataWithNode(
          dataType,
          target as InsertableNode
        );
        const updateCreator = getUpdateCreatorFunc(dataType);
        const update = updateCreator(nextProfileData);
        createResponse(update, 'graphQLError');
        modifiedEditData.push(editDataErr);
      }
    } else if (action === 'add') {
      const node = getCreatorFunc(dataType)() as Mutable<InsertableNode>;
      node.id = '';
      node.primary = false;
      const editDataA = createEditItem(dataType, node);
      const addFunc = getAddFunc(dataType);
      addFunc(nextProfileData, [editDataA.profileData]);
      const updateCreator = getUpdateCreatorFunc(dataType);
      const update = updateCreator(nextProfileData);
      createResponse(update);
      modifiedEditData.push(editDataA);
    }
  });
  return {
    mocks,
    modifiedEditData,
  };
}
