import {
  Button,
  IconPenLine,
  IconMinusCircle,
  IconStarFill,
  IconStar,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { Action, EditData } from '../../helpers/mutationEditor';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';

type Props = {
  handler: (action: Action) => Promise<void>;
  actions: Pick<EditData, 'editable' | 'primary' | 'removable'> & {
    setPrimary: boolean;
  };
  buttonClassNames?: string;
};

function Actions(props: Props): React.ReactElement {
  const { actions, handler, buttonClassNames } = props;
  const { t } = useTranslation();
  const { editable, primary, removable, setPrimary } = actions;
  const buttonStyle = [commonFormStyles.supplementaryButton];
  if (buttonClassNames) {
    buttonStyle.push(buttonClassNames);
  }
  return (
    <div className={commonFormStyles.actions}>
      {setPrimary && primary && (
        <div className={commonFormStyles.primaryContainer}>
          <IconStarFill />
          <span>{t('profileForm.primary')}</span>
        </div>
      )}
      {setPrimary && !primary && (
        <Button
          variant="supplementary"
          iconLeft={<IconStar />}
          onClick={async () => {
            await handler('set-primary');
          }}
          className={classNames(buttonStyle)}
        >
          {t('profileForm.setPrimary')}
        </Button>
      )}
      {editable && (
        <Button
          variant="supplementary"
          iconLeft={<IconPenLine />}
          onClick={async () => {
            await handler('edit');
          }}
          className={classNames(buttonStyle)}
        >
          {t('profileForm.edit')}
        </Button>
      )}
      {removable && (
        <Button
          variant="supplementary"
          iconLeft={<IconMinusCircle />}
          onClick={async () => {
            await handler('remove');
          }}
          className={classNames(buttonStyle)}
        >
          {t('profileForm.remove')}
        </Button>
      )}
    </div>
  );
}

export default Actions;
