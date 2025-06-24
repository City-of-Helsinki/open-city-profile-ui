import React from 'react';
import { useTranslation } from 'react-i18next';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { Action } from '../../hooks/useProfileDataEditor';

type Props = {
  action: Action | undefined;
  testId: string;
};

const SaveIndicator = (props: Props): React.ReactElement | null => {
  const { action, testId } = props;
  const { t } = useTranslation();
  if (!action) {
    return null;
  }
  const translationKey =
    action === 'remove' ? 'notification.removing' : 'notification.saving';
  return (
    <div
      role="alert"
      className={commonFormStyles['visually-hidden']}
      data-testid={`${testId}-save-indicator`}
    >
      {t(translationKey)}
    </div>
  );
};

export default SaveIndicator;
