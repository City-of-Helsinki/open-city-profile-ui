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

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { EditData, EditDataValue } from '../../helpers/editData';
import {
  Action,
  ActionListenerReturnType,
} from '../../hooks/useProfileDataEditor';

type Props = {
  handler: ActionHandler;
  actions: Pick<EditData, 'primary'> & {
    setPrimary: boolean;
    removable: boolean;
  };
  buttonClassNames?: string;
  editButtonId?: string;
  testId: string;
  disabled?: boolean;
};

export type ActionHandler = (
  action: Action,
  newValue?: Partial<EditDataValue>
) => ActionListenerReturnType;

function EditButtons(props: Props): React.ReactElement {
  const {
    actions,
    handler,
    buttonClassNames,
    editButtonId,
    disabled,
    testId,
  } = props;
  const { t } = useTranslation();
  const { primary, removable, setPrimary } = actions;
  const buttonStyle = [commonFormStyles.supplementaryButton];
  const editButtonIdAttr = editButtonId ? { id: editButtonId } : undefined;
  if (buttonClassNames) {
    buttonStyle.push(buttonClassNames);
  }
  return (
    <div className={commonFormStyles.actions}>
      {setPrimary && primary && (
        <div
          className={commonFormStyles.primaryContainer}
          data-testid={`${testId}-primary-indicator`}
        >
          <IconStarFill aria-hidden="true" />
          <span aria-hidden="true">{t('profileForm.primary')}</span>
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
          disabled={disabled}
          data-testid={`${testId}-set-primary-button`}
        >
          {t('profileForm.setPrimary')}
        </Button>
      )}
      <Button
        variant="supplementary"
        iconLeft={<IconPenLine />}
        onClick={async () => {
          await handler('edit');
        }}
        className={classNames(buttonStyle)}
        disabled={disabled}
        {...editButtonIdAttr}
      >
        {t('profileForm.edit')}
      </Button>
      {removable && (
        <Button
          variant="supplementary"
          iconLeft={<IconMinusCircle />}
          onClick={async () => {
            await handler('remove');
          }}
          className={classNames(buttonStyle)}
          disabled={disabled}
          data-testid={`${testId}-remove-button`}
        >
          {t('profileForm.remove')}
        </Button>
      )}
    </div>
  );
}

export default EditButtons;
