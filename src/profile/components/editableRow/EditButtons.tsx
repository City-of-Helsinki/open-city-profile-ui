import { Button } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { ActionHandler } from './Actions';

type Props = {
  handler: ActionHandler;
  disabled: boolean;
  alignLeft?: boolean;
};

function EditButtons(props: Props): React.ReactElement {
  const { t } = useTranslation();
  const { handler, alignLeft, disabled } = props;
  return (
    <div
      className={classNames([
        commonFormStyles.editButtons,
        commonFormStyles.editButtons,
        alignLeft && commonFormStyles.alignLeft,
      ])}
    >
      <Button
        type="submit"
        disabled={disabled}
        className={commonFormStyles.responsiveButton}
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
      >
        {t('profileForm.cancel')}
      </Button>
    </div>
  );
}

export default EditButtons;
