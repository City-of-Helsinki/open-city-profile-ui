import { useState } from 'react';
import to from 'await-to-js';

import { EditData, EditDataValue, isNewItem } from '../helpers/editData';
import { Action } from './useProfileDataEditor';
import { ActionHandler } from '../components/editButtons/EditButtons';
import { RowItemProps } from '../components/multiItemEditor/MultiItemEditor';
import { useFocusSetter } from './useFocusSetter';

export type EditHandling = {
  currentAction: Action;
  isEditing: boolean;
  isNew: boolean;
  actionHandler: ActionHandler;
  editButtonId: string;
  removeButtonId: string;
  testId: string;
  getData: () => EditData;
};

export interface ActionRejection {
  removeCancelled: boolean;
}

export const useCommonEditHandling = (props: RowItemProps): EditHandling => {
  const { data, onAction, dataType } = props;

  const isNew = data ? isNewItem(data) : false;
  const testId = `${dataType}-item-0`;
  const [isEditing, setEditing] = useState(isNew);
  const [currentAction, setCurrentAction] = useState<Action>(undefined);
  const [editButtonId, setFocusToEditButton] = useFocusSetter({
    targetId: `${testId}-edit-button`,
  });
  const [removeButtonId, setFocusToRemoveButton] = useFocusSetter({
    targetId: `${testId}-remove-button`,
  });
  const actionHandler: ActionHandler = async (action, newValue) => {
    if (!data) {
      return Promise.reject();
    }
    if (action === 'set-primary' || action === 'remove' || action === 'save') {
      setCurrentAction(action);
    }
    const [err] = await to(onAction(action, data, newValue as EditDataValue));
    if (isNew) {
      if (err) {
        setCurrentAction(undefined);
      }
      return Promise.resolve();
    }
    if (err || action !== 'remove') {
      setCurrentAction(undefined);
    }
    if (err && ((err as unknown) as ActionRejection).removeCancelled) {
      setFocusToRemoveButton();
    }
    if ((action === 'cancel' || action === 'save') && !err) {
      setFocusToEditButton();
      setEditing(false);
    } else if (action === 'edit') {
      setEditing(true);
    }
    return Promise.resolve();
  };

  return {
    actionHandler,
    isEditing,
    currentAction,
    isNew,
    editButtonId,
    removeButtonId,
    testId,
    getData: () => {
      if (!data) {
        throw new Error('Editable data does not exist');
      }
      return data;
    },
  };
};
