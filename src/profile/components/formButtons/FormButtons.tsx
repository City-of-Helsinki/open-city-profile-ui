import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from 'hds-react';

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
    <div
      className={classNames(
        commonFormStyles['responsive-flex-box-columns-rows'],
        commonFormStyles['edit-buttons'],
        commonFormStyles['form-buttons']
      )}
    >
      <Button
        type="submit"
        disabled={disabled}
        className={commonFormStyles['responsive-button']}
        data-testid={`${testId}-save-button`}
      >
        {t('profileForm.submit')}
      </Button>
      <Button
        variant={ButtonVariant.Secondary}
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
