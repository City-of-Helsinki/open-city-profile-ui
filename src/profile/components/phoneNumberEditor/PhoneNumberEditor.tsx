import React from 'react';
import { useTranslation } from 'react-i18next';

import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { EditDataType } from '../../helpers/editData';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import MultiItemPhoneRow from '../multiItemPhoneRow/MultiItemPhoneRow';

const PhoneNumberEditor = (): React.ReactElement | null => {
  const dataType: EditDataType = 'phones';
  const { t } = useTranslation();
  const editHandler = useCommonEditHandling({
    dataType,
    disableEditButtons: false,
  });

  const { noticationContent, confirmationModalProps } = editHandler;
  return (
    <>
      <div className={commonFormStyles['editor-description-container']}>
        <h2>{t('profileInformation.contact')}</h2>
      </div>
      <MultiItemPhoneRow editHandler={editHandler} />
      <AccessibilityFieldHelpers dataType={dataType} />
      <EditingNotifications
        content={noticationContent.content}
        dataType={dataType}
      />
      <ConfirmationModal {...confirmationModalProps} />
    </>
  );
};

export default PhoneNumberEditor;
