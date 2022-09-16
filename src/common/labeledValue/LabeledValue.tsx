import React from 'react';
import classNames from 'classnames';

import styles from './LabeledValue.module.css';

type Props = {
  label: string;
  value: string | null | undefined;
  testId?: string;
};

function LabeledValue({ label, value, testId }: Props): React.ReactElement {
  const labelTestId = testId ? { 'data-testid': `${testId}-label` } : null;
  const valueTestId = testId ? { 'data-testid': `${testId}-value` } : null;
  return (
    <div className={styles['wrapper']}>
      <strong className={styles['label']} {...labelTestId}>
        {label}
      </strong>
      <span className={classNames(styles['value'])} {...valueTestId}>
        {value || '–'}
      </span>
    </div>
  );
}

export default LabeledValue;
