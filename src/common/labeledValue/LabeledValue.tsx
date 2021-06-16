import React from 'react';
import { IconCheckCircleFill } from 'hds-react';
import classNames from 'classnames';

import styles from './LabeledValue.module.css';
import commonFormStyles from '../cssHelpers/form.module.css';

type Props = {
  label: string;
  value: string | null | undefined;
  verifiedInfoText?: string;
  testId?: string;
};

function LabeledValue({
  label,
  value,
  verifiedInfoText,
  testId,
}: Props): React.ReactElement {
  const labelTestId = testId ? { 'data-testid': `${testId}-label` } : null;
  const valueTestId = testId ? { 'data-testid': `${testId}-value` } : null;
  return (
    <div className={styles['wrapper']}>
      <strong className={styles['label']} {...labelTestId}>
        {label}
      </strong>
      <span
        className={classNames(
          styles['value'],
          verifiedInfoText && styles['with-icon']
        )}
        {...valueTestId}
      >
        {value || '–'}
        {verifiedInfoText && (
          <span className={classNames(commonFormStyles.icon, styles['icon'])}>
            <IconCheckCircleFill aria-hidden="true" />
            <span className={commonFormStyles.visuallyHidden}>
              {verifiedInfoText}
            </span>
          </span>
        )}
      </span>
    </div>
  );
}

export default LabeledValue;
