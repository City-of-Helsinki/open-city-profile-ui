import { useState } from 'react';

import to from '../../../common/awaitTo';
import {
  Action,
  ActionListener,
  EditData,
  isNew,
  resetEditDataValue,
} from '../../helpers/mutationEditor';
import { useAutoFocus } from '../../helpers/useAutoFocus';
import { ActionHandler } from './Actions';

type UseActionHandlingProps = {
  onAction: ActionListener;
  data: EditData;
  testId: string;
};

type UseActionHandlingReturnType = {
  autoFocusTargetId: string;
  currentSaveAction: Action | undefined;
  isNewItem: boolean;
  isEditing: boolean;
  actionHandler: ActionHandler;
};

export const useCommonEditHandling = (
  props: UseActionHandlingProps
): UseActionHandlingReturnType => {
  const { data, onAction, testId } = props;
  // new item will never autofocus to "edit"-button, but React hooks cannot be conditional
  const { autoFocusTargetId, activateAutoFocusing } = useAutoFocus({
    targetId: `${testId}-edit-button`,
  });
  const isNewItem = isNew(data);
  const [isEditing, setEditing] = useState(isNewItem);
  const [currentSaveAction, setCurrentSaveAction] = useState<
    Action | undefined
  >(undefined);

  const actionHandler: ActionHandler = async action => {
    if (action === 'set-primary' || action === 'remove' || action === 'save') {
      setCurrentSaveAction(action);
    }
    const [err] = await to(onAction(action, data));
    if (!err && isNewItem) {
      return Promise.resolve();
    }
    if (err || action !== 'remove') {
      setCurrentSaveAction(undefined);
    }
    if (action === 'cancel' && !isNewItem) {
      resetEditDataValue(data);
      activateAutoFocusing();
      setEditing(false);
    } else if (action === 'edit') {
      setEditing(true);
    } else if (action === 'save' && !err) {
      activateAutoFocusing();
      setEditing(false);
    }
    return Promise.resolve();
  };
  return {
    autoFocusTargetId,
    actionHandler,
    isEditing,
    currentSaveAction,
    isNewItem,
  };
};
