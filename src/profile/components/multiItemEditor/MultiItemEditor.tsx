import React from 'react';

import MultiItemPhoneRow from '../multiItemPhoneRow/MultiItemPhoneRow';
import MultiItemAddressRow from '../multiItemAddressRow/MultiItemAddressRow';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import { EditDataType } from '../../helpers/editData';
import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';

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
      <RowComponent editHandler={editHandler} />
      <AccessibilityFieldHelpers dataType={dataType} />
      <EditingNotifications
        content={noticationContent.content}
        dataType={dataType}
      />
      <ConfirmationModal {...confirmationModalProps} />
    </>
  );
}

export default MultiItemEditor;
