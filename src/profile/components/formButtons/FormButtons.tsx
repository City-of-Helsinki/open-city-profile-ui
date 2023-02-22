import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import StyledButton from '../../../common/styledButton/StyledButton';
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
        commonFormStyles['edit-buttons']
      )}
    >
      <StyledButton
        type="submit"
        disabled={disabled}
        className={commonFormStyles['responsive-button']}
        data-testid={`${testId}-save-button`}
      >
        {t('profileForm.submit')}
      </StyledButton>
      <StyledButton
        variant="secondary"
        onClick={async () => {
          await handler('cancel');
        }}
        className={commonFormStyles['responsive-button']}
        disabled={disabled}
        data-testid={`${testId}-cancel-button`}
      >
        {t('profileForm.cancel')}
      </StyledButton>
    </div>
  );
}

export default FormButtons;
