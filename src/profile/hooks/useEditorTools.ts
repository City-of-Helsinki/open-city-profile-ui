import to from 'await-to-js';
import { useTranslation } from 'react-i18next';

import useNotificationContent from '../components/editingNotifications/useNotificationContent';
import { useVerifiedPersonalInformation } from '../context/ProfileContext';
import {
  EditDataType,
  EditDataValue,
  isNewItem,
  isSettingPrimary,
} from '../helpers/editData';
import { ActionRejection } from './useCommonEditHandling';
import { useConfirmationModal } from './useConfirmationModal';
import { useFocusSetter } from './useFocusSetter';
import { ActionListener, useProfileDataEditor } from './useProfileDataEditor';

export type UseEditorToolsProps = {
  dataType: Extract<EditDataType, 'addresses' | 'phones' | 'emails'>;
  translationKeys: {
    modalTitle: string;
  };
};
type HookReturnType = {
  onAction: ActionListener;
  setPrimaryInProgress: boolean;
  userIsVerified: boolean;
  confirmationModalProps: ReturnType<typeof useConfirmationModal>['modalProps'];
  noticationContent: ReturnType<typeof useNotificationContent>;
  editDataList: ReturnType<typeof useProfileDataEditor>['editDataList'];
  addFuncs: {
    add: ReturnType<typeof useProfileDataEditor>['add'];
    hideAddButton: boolean;
    isAddButtonDisabled: boolean;
    addButtonId: string;
  };
};

export const useEditorTools = ({
  dataType,
  translationKeys,
}: UseEditorToolsProps): HookReturnType => {
  const {
    editDataList,
    save,
    reset,
    add,
    hasNew,
    remove,
    setNewPrimary,
  } = useProfileDataEditor({
    dataType,
  });
  const { t } = useTranslation();
  const noticationContent = useNotificationContent();

  const {
    setErrorMessage,
    setSuccessMessage,
    clearMessage,
  } = noticationContent;

  const {
    showModal,
    modalProps: confirmationModalProps,
  } = useConfirmationModal();
  const [addButtonId, setFocusToAddButton] = useFocusSetter({
    targetId: `${dataType}-add-button`,
  });
  const isAddButtonDisabled = hasNew();
  const setPrimaryInProgress = isSettingPrimary(editDataList);
  const hideAddButton = editDataList.length > 0;
  const userIsVerified = !!useVerifiedPersonalInformation();

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
    if (isNewItem(item)) {
      setFocusToAddButton();
    }
    setSuccessMessage(action);
    return Promise.resolve();
  };

  const onAction: ActionListener = async (action, item, newValue) => {
    clearMessage();
    if (action === 'cancel') {
      if (isNewItem(item)) {
        setFocusToAddButton();
        await remove(item);
      } else {
        reset(item);
      }
    } else if (action === 'remove' || action === 'save') {
      if (action === 'remove') {
        const [rejected] = await to(
          showModal({
            actionButtonText: t('confirmationModal.remove'),
            title: t(translationKeys.modalTitle),
          })
        );
        if (rejected) {
          return Promise.reject({
            removeCancelled: true,
          } as ActionRejection);
        }
      }
      return executeActionAndNotifyUser(action, item, newValue);
    } else if (action === 'set-primary') {
      const [err] = await to(setNewPrimary(item));
      if (err) {
        setErrorMessage(action);
      } else {
        setSuccessMessage(action);
      }
    } else if (action === 'add') {
      clearMessage();
      add();
    }
    return Promise.resolve();
  };

  return {
    onAction,
    addFuncs: {
      hideAddButton,
      isAddButtonDisabled,
      addButtonId,
      add,
    },
    confirmationModalProps,
    noticationContent,
    userIsVerified,
    editDataList,
    setPrimaryInProgress,
  };
};
