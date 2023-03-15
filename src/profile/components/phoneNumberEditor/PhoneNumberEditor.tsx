import React from 'react';
import { useTranslation } from 'react-i18next';

import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { EditDataType } from '../../helpers/editData';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';
import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import PhoneNumberFormAndData from './PhoneNumberFormAndData';

const PhoneNumberEditor = (): React.ReactElement | null => {
  const dataType: EditDataType = 'phones';
  const { t } = useTranslation();
  const editHandler = useCommonEditHandling({
    dataType,
    disableEditButtons: false,
  });

  const { confirmationModalProps } = editHandler;
  return (
    <>
      <div className={commonFormStyles['editor-description-container']}>
        <h2>{t('profileInformation.contact')}</h2>
      </div>
      <PhoneNumberFormAndData editHandler={editHandler} />
      <AccessibilityFieldHelpers dataType={dataType} />
      <ConfirmationModal {...confirmationModalProps} />
    </>
  );
};

export default PhoneNumberEditor;
