import { Button, IconPlusCircle } from 'hds-react';
import React from 'react';
import { t } from 'i18next';

import { EditHandling } from '../../hooks/useCommonEditHandling';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';

function AddButton({
  editHandler,
}: {
  editHandler: EditHandling;
}): React.ReactElement | null {
  const { addButtonId, hasNew, hasData, actionHandler, dataType } = editHandler;
  const isAddButtonDisabled = hasNew();
  const text = (function() {
    if (dataType === 'addresses') {
      return t('profileForm.addAddress');
    }
    if (dataType === 'phones') {
      return t('profileForm.addPhone');
    }
    return t('profileForm.addEmail');
  })();
  if (hasData()) {
    return null;
  }
  return (
    <Button
      iconLeft={<IconPlusCircle />}
      onClick={async () => {
        actionHandler('add');
      }}
      variant="secondary"
      disabled={isAddButtonDisabled}
      className={commonFormStyles['responsive-button']}
      id={addButtonId}
    >
      {text}
    </Button>
  );
}

export default AddButton;
