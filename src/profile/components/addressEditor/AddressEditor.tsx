import React from 'react';

import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { EditDataType } from '../../helpers/editData';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import AddressFormAndData from './AddressFormAndData';

const AddressEditor = (): React.ReactElement | null => {
  const dataType: EditDataType = 'addresses';

  const editHandler = useCommonEditHandling({
    dataType,
    disableEditButtons: false,
  });

  const { noticationContent, confirmationModalProps } = editHandler;
  return (
    <ProfileSection>
      <AddressFormAndData editHandler={editHandler} />
      <AccessibilityFieldHelpers dataType={dataType} />
      <EditingNotifications
        content={noticationContent.content}
        dataType={dataType}
      />
      <ConfirmationModal {...confirmationModalProps} />
    </ProfileSection>
  );
};
export default AddressEditor;
