import React from 'react';
import { useTranslation } from 'react-i18next';

import MultiItemPhoneRow from '../multiItemPhoneRow/MultiItemPhoneRow';
import MultiItemAddressRow from '../multiItemAddressRow/MultiItemAddressRow';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import { EditDataType } from '../../helpers/editData';
import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';
import AddButton from './AddButton';
import { useVerifiedPersonalInformation } from '../../context/ProfileContext';

type Props = {
  dataType: Extract<EditDataType, 'addresses' | 'phones'>;
};

function MultiItemEditor({ dataType }: Props): React.ReactElement | null {
  const { t } = useTranslation();
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

  const editHandler = useCommonEditHandling({
    dataType,
    disableEditButtons: false,
  });

  const { noticationContent, confirmationModalProps, hasData } = editHandler;
  const dataExists = hasData();
  return (
    <>
      {!dataExists && <NoItemsMessage />}
      {dataExists && (
        <div className={commonFormStyles['list']}>
          <RowComponent editHandler={editHandler} />
        </div>
      )}
      <AccessibilityFieldHelpers dataType={dataType} />
      <EditingNotifications
        content={noticationContent.content}
        dataType={dataType}
      />
      <AddButton editHandler={editHandler} />
      <ConfirmationModal {...confirmationModalProps} />
    </>
  );
}

export default MultiItemEditor;
