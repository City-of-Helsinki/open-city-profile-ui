import { Button } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { ActionHandler } from '../editButtons/EditButtons';

type Props = {
  handler: ActionHandler;
  disabled: boolean;
  alignLeft?: boolean;
  testId: string;
};

function FormButtons(props: Props): React.ReactElement {
  const { t } = useTranslation();
  const { handler, alignLeft, disabled, testId } = props;
  return (
    <div
      className={classNames([
        commonFormStyles.editButtons,
        alignLeft && commonFormStyles.alignLeft,
      ])}
    >
      <Button
        type="submit"
        disabled={disabled}
        className={commonFormStyles.responsiveButton}
        data-testid={`${testId}-save-button`}
      >
        {t('profileForm.submit')}
      </Button>
      <Button
        variant="secondary"
        onClick={async () => {
          await handler('cancel');
        }}
        className={commonFormStyles.responsiveButton}
        disabled={disabled}
        data-testid={`${testId}-cancel-button`}
      >
        {t('profileForm.cancel')}
      </Button>
    </div>
  );
}

export default FormButtons;
