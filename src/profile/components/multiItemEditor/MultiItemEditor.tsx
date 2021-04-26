import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import to from 'await-to-js';
import { Button, IconPlusCircle } from 'hds-react';

import ProfileSection from '../../../common/profileSection/ProfileSection';
import MultiItemRow from '../multiItemRow/MultiItemRow';
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
} from '../../helpers/editData';

type Props = {
  dataType: EditDataType;
};

export type RowItemProps = {
  data: EditData;
  onAction: ActionListener;
  testId: string;
  dataType: EditDataType;
};

function MultiItemEditor({ dataType }: Props): React.ReactElement | null {
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
  const { t } = useTranslation();
  const {
    content,
    setErrorMessage,
    setSuccessMessage,
    clearMessage,
  } = useNotificationContent();

  const hasAddressList = dataType === 'addresses';
  const isAddButtonDisabled = hasNew();
  const RowComponent = hasAddressList ? MultiItemAddressRow : MultiItemRow;
  const texts = (function() {
    if (dataType === 'emails') {
      return {
        modalTitle: t('confirmationModal.removeEmail'),
        title: t('profileInformation.emails'),
        listAriaLabel: t('profileInformation.ariaListTitleEmails'),
        listNumberTitle: t('profileInformation.email'),
        addNew: t('profileForm.addAnotherEmail'),
        noContent: t('profileInformation.noEmails'),
      };
    }
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
    const [err] = await to(save(item, newValue as EditDataValue));
    if (err) {
      setErrorMessage(action);
      return Promise.reject(err);
    }
    setSuccessMessage(action);
    return Promise.resolve();
  };

  const onAction: ActionListener = async (action, item, newValue) => {
    clearMessage();
    if (action === 'cancel') {
      if (isNewItem(item)) {
        await remove(item);
      } else {
        reset(item);
      }
    } else if (action === 'save') {
      return executeActionAndNotifyUser(action, item, newValue);
    }
    return Promise.resolve();
  };

  const NoItemsMessage = () => (
    <React.Fragment>
      {dataType === 'addresses' && (
        <h3 className={commonFormStyles.sectionTitle}>
          {texts.listNumberTitle}
        </h3>
      )}
      <p>{texts.noContent}</p>
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

      {!editDataList || (!editDataList.length && <NoItemsMessage />)}
      <ul aria-label={texts.listAriaLabel} className={commonFormStyles.list}>
        {editDataList.map((item, index) => (
          <li
            className={commonFormStyles.listItem}
            aria-label={`${texts.listNumberTitle} ${index + 1}`}
            key={item.id || 'new'}
          >
            <RowComponent
              data={item}
              onAction={onAction}
              testId={`${dataType}-${index}`}
              dataType={dataType}
            />
          </li>
        ))}
      </ul>
      <EditingNotifications content={content} dataType={dataType} />
      <Button
        iconLeft={<IconPlusCircle />}
        onClick={async () => {
          clearMessage();
          add();
        }}
        variant="secondary"
        disabled={isAddButtonDisabled}
        className={commonFormStyles.responsiveButton}
        id={`${dataType}-add-button`}
      >
        {texts.addNew}
      </Button>
    </ProfileSection>
  );
}

export default MultiItemEditor;
