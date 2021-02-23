import React from 'react';
import { Button, IconPlusCircle } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import to from '../../../common/awaitTo';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import EditableRow from '../editableRow/EditableRow';
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

  const { showModal, modalProps } = useConfirmationModal();
  const isAddButtonDisabled = hasNewItem(data);

  const executeActionAndNotifyUser: ActionListener = async (action, item) => {
    const func = action === 'save' ? save : remove;
    const [err] = await to(func(item));
    if (err) {
      setErrorMessage('', action);
      return Promise.reject();
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
                : t('confirmationModal.removePhone'),
          })
        );
        if (rejected) {
          return Promise.resolve();
        }
      }
      return executeActionAndNotifyUser(action, item);
    }
    if (action === 'set-primary') {
      await setPrimary(item);
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

  return (
    <ProfileSection title="">
      <h3 className={commonFormStyles.sectionTitle}>{getTitle()}</h3>
      <div>
        {data.map(item => (
          <EditableRow
            key={item.profileData.id || item.status}
            data={item}
            onAction={onAction}
          />
        ))}
        <EditingNotifications content={content} />
      </div>
      <Button
        iconLeft={<IconPlusCircle />}
        onClick={async () => {
          trackEvent({ category: 'form-action', action: 'add' });
          clearMessage();
          add();
        }}
        variant="secondary"
        disabled={isAddButtonDisabled}
      >
        {dataType === 'emails'
          ? t('profileForm.addAnotherEmail')
          : t('profileForm.addAnotherPhone')}
      </Button>
      <ConfirmationModal {...modalProps} />
    </ProfileSection>
  );
}

export default ProfileDataEditor;