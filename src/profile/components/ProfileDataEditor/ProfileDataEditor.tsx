import React from 'react';
import { Button, IconPlusCircle } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import classNames from 'classnames';

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
    targetId: `${dataType}-edit-notifications`,
  });

  const { showModal, modalProps } = useConfirmationModal();
  const isAddButtonDisabled = hasNewItem(data);
  const hasAddressList = dataType === 'addresses';

  const texts = (function() {
    if (dataType === 'emails') {
      return {
        modalTitle: t('confirmationModal.removeEmail'),
        title: t('profileInformation.emails'),
        listAriaLabel: t('profileInformation.ariaListTitleEmails'),
        listNumberTitle: t('profileInformation.email'),
        addNew: t('profileForm.addAnotherEmail'),
      };
    }
    if (dataType === 'phones') {
      return {
        modalTitle: t('confirmationModal.removePhone'),
        title: t('profileInformation.phones'),
        listAriaLabel: t('profileInformation.ariaListTitlePhones'),
        listNumberTitle: t('profileInformation.phone'),
        addNew: t('profileForm.addAnotherPhone'),
      };
    }
    return {
      modalTitle: t('confirmationModal.removeAddress'),
      title: t('profileInformation.addresses'),
      listAriaLabel: t('profileInformation.ariaListTitleAddresses'),
      listNumberTitle: t('profileInformation.address'),
      addNew: t('profileForm.addAnotherAddress'),
    };
  })();

  const executeActionAndNotifyUser: ActionListener = async (action, item) => {
    const wasNewItem = !item.profileData.id;
    const func = action === 'save' ? save : remove;
    const [err] = await to(func(item));
    if (err) {
      setErrorMessage('', action);
      return Promise.reject(err);
    }
    if (wasNewItem || action === 'remove') {
      activateAutoFocusing();
    }
    setSuccessMessage('', action);
    return Promise.resolve();
  };

  const onAction: ActionListener = async (action, item) => {
    trackEvent({ category: 'form-action', action });
    clearMessage();
    if (action === 'add') {
      add();
    } else if (action === 'cancel') {
      if (!item.profileData.id) {
        activateAutoFocusing();
        await remove(item);
      }
    } else if (action === 'remove' || action === 'save') {
      if (action === 'remove') {
        const [rejected] = await to(
          showModal({
            actionButtonText: t('confirmationModal.remove'),
            modalTitle: texts.modalTitle,
          })
        );
        if (rejected) {
          return Promise.reject({ removeCancelled: true });
        }
      }
      return executeActionAndNotifyUser(action, item);
    } else if (action === 'set-primary') {
      const [err] = await to(setPrimary(item));
      if (err) {
        setErrorMessage('', action);
      } else {
        setSuccessMessage('', action);
      }
    }
    return Promise.resolve();
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
      <h3
        className={classNames([
          commonFormStyles.sectionTitle,
          hasAddressList && commonFormStyles.visuallyHidden,
        ])}
      >
        {texts.title}
      </h3>

      {!data || (!data.length && <NoDataMessage />)}
      <ul aria-label={texts.listAriaLabel} className={commonFormStyles.list}>
        {data.map((item, index) => (
          <li
            className={commonFormStyles.listItem}
            aria-label={`${texts.listNumberTitle} ${index + 1}`}
            key={item.profileData.id || 'new'}
          >
            <RenderComponent data={item} onAction={onAction} />
          </li>
        ))}
      </ul>
      <EditingNotifications content={content} dataType={dataType} />
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
        {texts.addNew}
      </Button>
      <ConfirmationModal {...modalProps} />
    </ProfileSection>
  );
}

export default ProfileDataEditor;
