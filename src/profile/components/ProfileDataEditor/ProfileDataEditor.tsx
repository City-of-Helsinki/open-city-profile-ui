import React from 'react';
import { Button, IconPlusCircle } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import to from '../../../common/awaitTo';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import EditableRow from '../editableRow/EditableRow';
import EditableRowAddress from '../editableRow/EditableRowAddress';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import useNotificationContent from '../editingNotifications/useNotificationContent';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import { useProfileMutationHandler } from '../../helpers/hooks';
import {
  ActionListener,
  EditData,
  hasNewItem,
} from '../../helpers/mutationEditor';
import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import { useConfirmationModal } from '../modals/confirmationModal/hooks';
import { useAutoFocus } from '../../helpers/useAutoFocus';
import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';

type Props = {
  dataType: EditData['dataType'];
};

function ProfileDataEditor({ dataType }: Props): React.ReactElement | null {
  const {
    data,
    add,
    loading,
    remove,
    save,
    setPrimary,
  } = useProfileMutationHandler({
    dataType,
  });
  const { t } = useTranslation();
  const { trackEvent } = useMatomo();
  const {
    content,
    setErrorMessage,
    setSuccessMessage,
    clearMessage,
  } = useNotificationContent();
  const { autoFocusTargetId, activateAutoFocusing } = useAutoFocus({
    targetId: `${dataType}-new-item-button`,
  });

  const { showModal, modalProps } = useConfirmationModal();
  const isAddButtonDisabled = hasNewItem(data);
  const hasAddressList = dataType === 'addresses';

  const executeActionAndNotifyUser: ActionListener = async (action, item) => {
    const wasNewItem = !item.profileData.id;
    const func = action === 'save' ? save : remove;
    const [err] = await to(func(item));
    if (err) {
      setErrorMessage('', action);
      return Promise.reject();
    }
    if (wasNewItem) {
      activateAutoFocusing();
    }
    setSuccessMessage('', action);
    return Promise.resolve();
  };

  const onAction: ActionListener = async (action, item) => {
    trackEvent({ category: 'form-action', action });
    if (action === 'add') {
      clearMessage();
      add();
    } else if (action === 'cancel') {
      clearMessage();
      if (!item.profileData.id) {
        activateAutoFocusing();
        await remove(item);
      }
    } else if (action === 'remove' || action === 'save') {
      if (action === 'remove') {
        const [rejected] = await to(
          showModal({
            actionButtonText: t('confirmationModal.remove'),
            modalTitle:
              dataType === 'emails'
                ? t('confirmationModal.removeEmail')
                : dataType === 'phones'
                ? t('confirmationModal.removePhone')
                : t('confirmationModal.removeAddress'),
          })
        );
        if (rejected) {
          return Promise.resolve();
        }
      }
      return executeActionAndNotifyUser(action, item);
    }
    if (action === 'set-primary') {
      const [err] = await to(setPrimary(item));
      if (err) {
        setErrorMessage('', action);
      }
    }
    return Promise.resolve();
  };

  const getTitle = (): string => {
    if (dataType === 'emails') {
      return t('profileForm.email');
    }
    return t('profileForm.phone');
  };

  if (loading) {
    return null;
  }

  const RenderComponent =
    dataType === 'addresses' ? EditableRowAddress : EditableRow;

  const NoDataMessage = () => (
    <React.Fragment>
      {dataType === 'addresses' && (
        <h3 className={commonFormStyles.sectionTitle}>
          {t('profileInformation.address')}
        </h3>
      )}
      <p>
        {dataType === 'emails'
          ? t('profileInformation.noEmails')
          : dataType === 'phones'
          ? t('profileInformation.noPhones')
          : t('profileInformation.noAddresses')}
      </p>
    </React.Fragment>
  );

  return (
    <ProfileSection>
      {!hasAddressList && (
        <h3 className={commonFormStyles.sectionTitle}>{getTitle()}</h3>
      )}
      {!data || (!data.length && <NoDataMessage />)}
      {data.map(item => (
        <RenderComponent
          key={item.profileData.id || 'new'}
          data={item}
          onAction={onAction}
        />
      ))}
      <EditingNotifications content={content} />
      <AccessibilityFieldHelpers dataType={dataType} />
      <Button
        iconLeft={<IconPlusCircle />}
        onClick={async () => {
          trackEvent({ category: 'form-action', action: 'add' });
          clearMessage();
          add();
        }}
        variant="secondary"
        disabled={isAddButtonDisabled}
        className={commonFormStyles.responsiveButton}
        id={autoFocusTargetId}
      >
        {dataType === 'emails'
          ? t('profileForm.addAnotherEmail')
          : dataType === 'phones'
          ? t('profileForm.addAnotherPhone')
          : t('profileForm.addAnotherAddress')}
      </Button>
      <ConfirmationModal {...modalProps} />
    </ProfileSection>
  );
}

export default ProfileDataEditor;
