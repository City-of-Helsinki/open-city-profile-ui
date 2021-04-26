import { useEffect, useMemo, useState } from 'react';
import to from 'await-to-js';

import {
  EditData,
  EditDataType,
  createEditorForDataType,
  SaveType,
  EditDataValue,
  FormValues,
} from '../helpers/editData';
import { UpdateResult, useProfileMutations } from './useProfileMutations';

export type ProfileDataEditorReturnType = {
  editDataList: EditData[];
  save: (item: EditData, newValue: EditDataValue) => Promise<UpdateResult>;
  reset: (item: EditData) => void;
  add: () => void;
  hasNew: () => boolean;
  remove: (item: EditData) => Promise<UpdateResult | void>;
};

export type Action = SaveType | 'edit' | 'cancel' | 'save' | 'add';

export type ActionListenerReturnType = Promise<void | UpdateResult>;
export type ActionListener = (
  action: Action,
  data: EditData,
  value?: Partial<EditDataValue>
) => ActionListenerReturnType;

export function saveTypeToAction(saveType?: SaveType): Action | undefined {
  if (!saveType) {
    return undefined;
  }
  if (saveType === 'value') {
    return 'save';
  }
  if (saveType === 'remove' || saveType === 'set-primary') {
    return saveType;
  }
  return undefined;
}

export function useProfileDataEditor({
  dataType,
}: {
  dataType: EditDataType;
}): ProfileDataEditorReturnType {
  const { profileData, update: updateProfile } = useProfileMutations({
    dataType,
  });
  if (!profileData) {
    throw new Error(
      'No profile data for useProfileDataEditor. Hook used before data has been fetched.'
    );
  }
  const {
    getEditData,
    updateItemAndCreateSaveData,
    updateData,
    updateAfterSavingError,
    resetItem,
    addItem,
    hasNewItem,
    removeItem,
  } = useMemo(
    () => createEditorForDataType(profileData, dataType),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [, setUpdateTime] = useState<number>(Date.now());
  const triggerUpdate = () => {
    setUpdateTime(Date.now());
  };

  useEffect(() => {
    if (updateData(profileData)) {
      triggerUpdate();
    }
  }, [profileData, updateData]);

  const executeMutationUpdateAndHandleResult = async (
    formValues: Partial<FormValues>,
    targetId: string
  ): Promise<UpdateResult> => {
    const [err, success] = await to(updateProfile(formValues, profileData));
    if (err) {
      updateAfterSavingError(targetId);
      triggerUpdate();
      return Promise.reject(err);
    }
    // update is not triggered here
    // to keep editData and profile data in sync
    // update is done in useEffect() when new profile data is detected
    return Promise.resolve(success as UpdateResult);
  };

  const save: ProfileDataEditorReturnType['save'] = async (item, newValue) => {
    const formValues = updateItemAndCreateSaveData(item, newValue);
    triggerUpdate();
    return executeMutationUpdateAndHandleResult(formValues, item.id);
  };

  const reset: ProfileDataEditorReturnType['reset'] = item => {
    const success = resetItem(item);
    success && triggerUpdate();
  };

  const add = () => {
    addItem();
    triggerUpdate();
  };

  const hasNew = () => hasNewItem();

  const remove = async (item: EditData) => {
    removeItem(item);
    triggerUpdate();
    return Promise.resolve();
  };

  return {
    editDataList: getEditData(),
    save,
    reset,
    add,
    hasNew,
    remove,
  };
}
