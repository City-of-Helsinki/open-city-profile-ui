import React from 'react';
import { useTranslation } from 'react-i18next';
import to from 'await-to-js';
import { IconPlusCircle } from 'hds-react';

import MultiItemPhoneRow from '../multiItemPhoneRow/MultiItemPhoneRow';
import MultiItemAddressRow from '../multiItemAddressRow/MultiItemAddressRow';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import useNotificationContent from '../editingNotifications/useNotificationContent';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import {
  useProfileDataEditor,
  ActionListener,
} from '../../hooks/useProfileDataEditor';
import {
  EditData,
  EditDataType,
  EditDataValue,
  isNewItem,
  isSettingPrimary,
} from '../../helpers/editData';
import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import { useFocusSetter } from '../../hooks/useFocusSetter';
import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';
import { ActionRejection } from '../../hooks/useCommonEditHandling';
import { useVerifiedPersonalInformation } from '../../context/ProfileContext';
import StyledButton from '../../../common/styledButton/StyledButton';

type Props = {
  dataType: Extract<EditDataType, 'addresses' | 'phones'>;
};

export type RowItemProps = {
  data: EditData;
  onAction: ActionListener;
  testId: string;
  disableEditButtons: boolean;
};

function MultiItemEditor({ dataType }: Props): React.ReactElement | null {
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
  const {
    content,
    setErrorMessage,
    setSuccessMessage,
    clearMessage,
  } = useNotificationContent();

  const { showModal, modalProps } = useConfirmationModal();
  const [addButtonId, setFocusToAddButton] = useFocusSetter({
    targetId: `${dataType}-add-button`,
  });
  const isAddButtonDisabled = hasNew();
  const hideAddButton = editDataList.length > 0;
  const setPrimaryInProgress = isSettingPrimary(editDataList);
  const userIsVerified = !!useVerifiedPersonalInformation();
  const isAddressType = dataType === 'addresses';
  const RowComponent = isAddressType ? MultiItemAddressRow : MultiItemPhoneRow;
  const texts = (function() {
    if (!isAddressType) {
      return {
        modalTitle: t('confirmationModal.removePhone'),
        title: t('profileInformation.phone'),
        listAriaLabel: t('profileInformation.ariaListTitlePhones'),
        addNew: t('profileForm.addPhone'),
        noContent: t('profileInformation.noPhone'),
      };
    }
    return {
      modalTitle: t('confirmationModal.removeAddress'),
      title: userIsVerified
        ? t('profileInformation.addressTitleWhenHasVerifiedData')
        : t('profileInformation.address'),
      listAriaLabel: t('profileInformation.ariaListTitleAddresses'),
      addNew: t('profileForm.addAddress'),
      noContent: userIsVerified
        ? t('profileInformation.addressDescriptionNoWeakAddress')
        : t('profileInformation.addressDescriptionNoAddress'),
    };
  })();

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
            title: texts.modalTitle,
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
    }
    return Promise.resolve();
  };

  const NoItemsMessage = () => (
    <div
      className={
        isAddressType ? commonFormStyles['section-title-with-explanation'] : ''
      }
    >
      <h3
        className={
          isAddressType
            ? commonFormStyles['section-title']
            : commonFormStyles['label-size']
        }
      >
        {texts.title}
      </h3>
      <p data-testid={`${dataType}-no-data`}>{texts.noContent}</p>
    </div>
  );

  return (
    <>
      {!editDataList || (!editDataList.length && <NoItemsMessage />)}
      <ul aria-label={texts.listAriaLabel} className={commonFormStyles['list']}>
        {editDataList.map((item, index) => (
          <li
            className={commonFormStyles['list-item']}
            aria-label={`${texts.title} ${index + 1}`}
            key={item.id || 'new'}
          >
            <RowComponent
              data={item}
              onAction={onAction}
              testId={`${dataType}-${index}`}
              disableEditButtons={setPrimaryInProgress}
            />
          </li>
        ))}
      </ul>
      <AccessibilityFieldHelpers dataType={dataType} />
      <EditingNotifications content={content} dataType={dataType} />
      {!hideAddButton && (
        <StyledButton
          iconLeft={<IconPlusCircle />}
          onClick={async () => {
            clearMessage();
            add();
          }}
          variant="secondary"
          disabled={isAddButtonDisabled}
          className={commonFormStyles['responsive-button']}
          id={addButtonId}
        >
          {texts.addNew}
        </StyledButton>
      )}
      <ConfirmationModal {...modalProps} />
    </>
  );
}

export default MultiItemEditor;
