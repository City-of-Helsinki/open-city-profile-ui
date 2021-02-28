import { Button } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { Action, UpdateResult } from '../../helpers/mutationEditor';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';

type Props = {
  handler: (action: Action) => Promise<UpdateResult>;
  canSubmit: boolean;
  alignLeft?: boolean;
};

function EditButtons(props: Props): React.ReactElement {
  const { t } = useTranslation();
  const { handler, alignLeft, canSubmit } = props;
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
        disabled={!canSubmit}
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
      >
        {t('profileForm.cancel')}
      </Button>
    </div>
  );
}

export default EditButtons;
