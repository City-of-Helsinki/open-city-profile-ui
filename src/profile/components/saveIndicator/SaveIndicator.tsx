import React from 'react';
import { useTranslation } from 'react-i18next';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { Action } from '../../helpers/mutationEditor';

type Props = {
  currentAction: Action | undefined;
};

const SaveIndicator = (props: Props): React.ReactElement | null => {
  const { currentAction } = props;
  const { t } = useTranslation();
  if (!currentAction) {
    return null;
  }
  const translationKey =
    currentAction === 'remove'
      ? 'notification.removing'
      : 'notification.saving';
  return (
    <div role="alert" className={commonFormStyles.visuallyHidden}>
      {t(translationKey)}
    </div>
  );
};

export default SaveIndicator;
