import {
  Button,
  IconPenLine,
  IconMinusCircle,
  IconStarFill,
  IconStar,
  ButtonVariant,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  editButtonId?: string;
  removeButtonId?: string;
  testId: string;
  disabled?: boolean;
  ariaLabels: ActionAriaLabels;
};

export type ActionAriaLabels = {
  setPrimary?: string;
  edit?: string;
  remove?: string;
  primary?: string;
};

export type ActionHandler = (
  action: Action,
  newValue?: Partial<EditDataValue>
) => ActionListenerReturnType;

function EditButtons(props: Props): React.ReactElement {
  const {
    actions,
    handler,
    editButtonId,
    removeButtonId,
    disabled,
    testId,
    ariaLabels,
  } = props;
  const { t } = useTranslation();
  const { primary, removable, setPrimary } = actions;
  const editButtonIdAttr = editButtonId ? { id: editButtonId } : undefined;
  return (
    <div className={commonFormStyles['edit-buttons-container']}>
      {setPrimary && primary && (
        <div
          className={commonFormStyles['primary-container']}
          data-testid={`${testId}-primary-indicator`}
        >
          <IconStarFill aria-hidden="true" />
          <span aria-hidden="true">{t('profileForm.primary')}</span>
          <span className={commonFormStyles['visually-hidden']}>
            {ariaLabels.primary}
          </span>
        </div>
      )}
      {setPrimary && !primary && (
        <Button
          variant={ButtonVariant.Supplementary}
          iconStart={<IconStar />}
          onClick={async () => {
            await handler('set-primary');
          }}
          disabled={disabled}
          data-testid={`${testId}-set-primary-button`}
          aria-label={ariaLabels.setPrimary}
        >
          {t('profileForm.setPrimary')}
        </Button>
      )}
      <Button
        iconStart={<IconPenLine />}
        onClick={async () => {
          await handler('edit');
        }}
        disabled={disabled}
        aria-label={ariaLabels.edit}
        {...editButtonIdAttr}
      >
        {t('profileForm.edit')}
      </Button>
      {removable && (
        <Button
          variant={ButtonVariant.Secondary}
          iconStart={<IconMinusCircle />}
          onClick={async () => {
            await handler('remove');
          }}
          disabled={disabled}
          id={removeButtonId}
          aria-label={ariaLabels.remove}
        >
          {t('profileForm.remove')}
        </Button>
      )}
    </div>
  );
}

export default EditButtons;
