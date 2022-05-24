import { Button } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { ActionHandler } from '../editButtons/EditButtons';

type Props = {
  handler: ActionHandler;
  disabled: boolean;
  testId: string;
};

function FormButtons(props: Props): React.ReactElement {
  const { t } = useTranslation();
  const { handler, disabled, testId } = props;
  return (
    <div className={commonFormStyles['edit-buttons']}>
      <Button
        type="submit"
        disabled={disabled}
        className={commonFormStyles['responsive-button']}
        data-testid={`${testId}-save-button`}
      >
        {t('profileForm.submit')}
      </Button>
      <Button
        variant="secondary"
        onClick={async () => {
          await handler('cancel');
        }}
        className={commonFormStyles['responsive-button']}
        disabled={disabled}
        data-testid={`${testId}-cancel-button`}
      >
        {t('profileForm.cancel')}
      </Button>
    </div>
  );
}

export default FormButtons;
