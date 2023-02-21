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

type Props = {
  dataType: Extract<EditDataType, 'addresses' | 'phones'>;
};

function MultiItemEditor({ dataType }: Props): React.ReactElement | null {
  const isAddressType = dataType === 'addresses';
  const RowComponent = isAddressType ? MultiItemAddressRow : MultiItemPhoneRow;

  const editHandler = useCommonEditHandling({
    dataType,
    disableEditButtons: false,
  });

  const { noticationContent, confirmationModalProps } = editHandler;
  return (
    <>
      <div className={commonFormStyles['list']}>
        <RowComponent editHandler={editHandler} />
      </div>
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
