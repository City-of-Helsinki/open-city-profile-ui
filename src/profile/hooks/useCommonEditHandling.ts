import { useState } from 'react';
import to from 'await-to-js';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import {
  basicDataType,
  EditData,
  EditDataType,
  EditDataValue,
  isNewItem,
} from '../helpers/editData';
import {
  Action,
  ActionListener,
  useProfileDataEditor,
} from './useProfileDataEditor';
import { ActionHandler } from '../components/editButtons/EditButtons';
import { useFocusSetter } from './useFocusSetter';
import useNotificationContent from '../components/editingNotifications/useNotificationContent';
import { useConfirmationModal } from './useConfirmationModal';
import { AnyObject } from '../../graphql/typings';

type EditHandlingProps = {
  data?: EditData;
  dataType: Extract<
    EditDataType,
    'addresses' | 'phones' | 'emails' | 'basic-data'
  >;
  disableEditButtons: boolean;
};

export type EditHandling = {
  currentAction: Action;
  isEditing: boolean;
  isNew: boolean;
  actionHandler: ActionHandler;
  editButtonId: string;
  removeButtonId: string;
  addButtonId: string;
  testId: string;
  getData: () => EditData;
  hasData: () => boolean;
  confirmationModalProps: ReturnType<typeof useConfirmationModal>['modalProps'];
  notificationContent: ReturnType<typeof useNotificationContent>;
  hasNew: () => boolean;
  dataType: EditHandlingProps['dataType'];
};

export interface ActionRejection {
  removeCancelled: boolean;
}

export const useCommonEditHandling = (
  props: EditHandlingProps
): EditHandling => {
  const { dataType } = props;
  const {
    editDataList,
    save,
    reset,
    add,
    hasNew,
    remove,
  } = useProfileDataEditor({
    dataType,
  });

  const data = editDataList[0];

  const isNew = data ? isNewItem(data) : false;
  const testId =
    dataType === 'emails' || dataType === basicDataType
      ? dataType
      : `${dataType}-0`;
  const [isEditing, setEditing] = useState(isNew);
  const [currentAction, setCurrentAction] = useState<Action>(undefined);
  const [editButtonId, setFocusToEditButton] = useFocusSetter({
    targetId: `${testId}-edit-button`,
  });
  const [removeButtonId, setFocusToRemoveButton] = useFocusSetter({
    targetId: `${testId}-remove-button`,
  });

  const { t } = useTranslation();

  const notificationContent = useNotificationContent();

  const {
    setErrorMessage,
    setSuccessMessage,
    clearMessage,
  } = notificationContent;

  const { showModal, modalProps } = useConfirmationModal();

  const [addButtonId, setFocusToAddButton] = useFocusSetter({
    targetId: `${dataType}-add-button`,
  });

  const executeActionAndNotifyUser: ActionListener = async (
    action,
    item,
    newValue
  ) => {
    const func = action === 'save' ? save : remove;
    const [err] = await to(func(item, newValue as EditDataValue));
    if (err) {
      setErrorMessage(action);
      return Promise.reject(err);
    }
    setSuccessMessage(action);
    return Promise.resolve();
  };

  const toggleEditMode = (edit: boolean) => {
    if (isEditing === edit) {
      return;
    }
    setEditing(edit);
  };

  const addItem = async () => {
    clearMessage();
    toggleEditMode(true);
    add();
    return Promise.resolve();
  };

  const removeItem = async (item: EditData) => {
    setCurrentAction('remove');
    const [rejected] = await to(
      showModal({
        actionButtonText: t('confirmationModal.remove'),
        title:
          dataType === 'phones'
            ? t('confirmationModal.removePhone')
            : t('confirmationModal.removeAddress'),
      })
    );
    if (rejected) {
      setFocusToRemoveButton();
      setCurrentAction(undefined);
      return Promise.resolve();
    }
    await to(executeActionAndNotifyUser('remove', item));
    setFocusToAddButton();
    setCurrentAction(undefined);
    return Promise.resolve();
  };

  const cancelItem = async (item: EditData) => {
    toggleEditMode(false);
    if (isNewItem(item)) {
      setFocusToAddButton();
      await remove(item);
    } else {
      reset(item);
      setFocusToEditButton();
    }
    return Promise.resolve();
  };

  const saveItem = async (item: EditData, newValue: Partial<EditDataValue>) => {
    clearMessage();
    if (_.isMatch(newValue as AnyObject, item.value)) {
      setSuccessMessage('save');
      return cancelItem(item);
    }
    setCurrentAction('save');
    const [err] = await to(executeActionAndNotifyUser('save', item, newValue));
    setCurrentAction(undefined);
    if (!err) {
      toggleEditMode(false);
      setFocusToEditButton();
    } else {
      // this does not alter inputs
      // the editData object must be reset to previous value
      // or isMatch would match it and show incorrect save success
      reset(item);
    }
    return Promise.resolve({ success: !!err });
  };

  const actionHandler: ActionHandler = async (action, newValue) => {
    if (!data) {
      if (action === 'add') {
        return addItem();
      }
      return Promise.reject();
    }
    if (action === 'cancel') {
      return cancelItem(data);
    } else if (action === 'remove') {
      return removeItem(data);
    } else if (action === 'save') {
      return saveItem(data, newValue as EditDataValue);
    } else if (action === 'edit') {
      clearMessage();
      toggleEditMode(true);
      return Promise.resolve();
    }
    return Promise.reject();
  };

  return {
    actionHandler,
    isEditing,
    currentAction,
    isNew,
    editButtonId,
    removeButtonId,
    addButtonId,
    testId,
    getData: () => {
      if (!data) {
        throw new Error('Editable data does not exist');
      }
      return data;
    },
    hasData: () => !!data,
    hasNew,
    notificationContent,
    confirmationModalProps: modalProps,
    dataType,
  };
};
