import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import to from 'await-to-js';
import { Button, IconPlusCircle } from 'hds-react';

import ProfileSection from '../../../common/profileSection/ProfileSection';
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
  const hasAddressList = dataType === 'addresses';
  const isAddButtonDisabled = hasNew();
  const setPrimaryInProgress = isSettingPrimary(editDataList);
  const RowComponent = hasAddressList ? MultiItemAddressRow : MultiItemPhoneRow;
  const texts = (function() {
    if (dataType === 'phones') {
      return {
        modalTitle: t('confirmationModal.removePhone'),
        title: t('profileInformation.phones'),
        listAriaLabel: t('profileInformation.ariaListTitlePhones'),
        listNumberTitle: t('profileInformation.phone'),
        addNew: t('profileForm.addAnotherPhone'),
        noContent: t('profileInformation.noPhones'),
      };
    }
    return {
      modalTitle: t('confirmationModal.removeAddress'),
      title: t('profileInformation.addresses'),
      listAriaLabel: t('profileInformation.ariaListTitleAddresses'),
      listNumberTitle: t('profileInformation.address'),
      addNew: t('profileForm.addAnotherAddress'),
      noContent: t('profileInformation.noAddresses'),
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
    <React.Fragment>
      {dataType === 'addresses' && (
        <h2 className={commonFormStyles['section-title']}>
          {texts.listNumberTitle}
        </h2>
      )}
      <p>{texts.noContent}</p>
    </React.Fragment>
  );

  return (
    <ProfileSection>
      <h2
        className={classNames([
          commonFormStyles['section-title'],
          hasAddressList && commonFormStyles['visually-hidden'],
        ])}
      >
        {texts.title}
      </h2>

      {!editDataList || (!editDataList.length && <NoItemsMessage />)}
      <ul aria-label={texts.listAriaLabel} className={commonFormStyles['list']}>
        {editDataList.map((item, index) => (
          <li
            className={commonFormStyles['list-item']}
            aria-label={`${texts.listNumberTitle} ${index + 1}`}
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
      <Button
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
      </Button>
      <ConfirmationModal {...modalProps} />
    </ProfileSection>
  );
}

export default MultiItemEditor;
