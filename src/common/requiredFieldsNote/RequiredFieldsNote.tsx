import React from 'react';
import { useTranslation } from 'react-i18next';

import commonFormStyles from '../cssHelpers/form.module.css';

export function RequiredFieldsNote(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <span className={commonFormStyles['note']} aria-hidden>
      {t('validation.requiredFieldIndication')}
    </span>
  );
}
