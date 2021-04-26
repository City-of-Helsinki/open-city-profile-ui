import { useState } from 'react';
import to from 'await-to-js';

import { EditDataValue, isNewItem } from '../helpers/editData';
import { Action } from './useProfileDataEditor';
import { ActionHandler } from '../components/editButtons/EditButtons';
import { RowItemProps } from '../components/multiItemEditor/MultiItemEditor';

type UseActionHandlingReturnType = {
  currentAction: Action;
  isEditing: boolean;
  isNew: boolean;
  actionHandler: ActionHandler;
};

export const useCommonEditHandling = (
  props: RowItemProps
): UseActionHandlingReturnType => {
  const { data, onAction } = props;
  const isNew = isNewItem(data);
  const [isEditing, setEditing] = useState(isNew);
  const [currentAction, setCurrentAction] = useState<Action>(undefined);
  const actionHandler: ActionHandler = async (action, newValue) => {
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
    if (action === 'cancel') {
      setEditing(false);
    } else if (action === 'edit') {
      setEditing(true);
    } else if (action === 'save' && !err) {
      setEditing(false);
    }
    return Promise.resolve();
  };

  return {
    actionHandler,
    isEditing,
    currentAction,
    isNew,
  };
};
