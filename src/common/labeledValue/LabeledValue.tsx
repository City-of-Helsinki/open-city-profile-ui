import React from 'react';
import { IconCheckCircleFill } from 'hds-react';
import classNames from 'classnames';

import styles from './LabeledValue.module.css';
import commonFormStyles from '../cssHelpers/form.module.css';

type Props = {
  label: string;
  value: string | null | undefined;
  showCheckIcon?: boolean;
};

function LabeledValue({
  label,
  value,
  showCheckIcon,
}: Props): React.ReactElement {
  return (
    <div className={styles.wrapper}>
      <strong className={styles.label}>{label}</strong>
      <span
        className={classNames(styles.value, showCheckIcon && styles.withIcon)}
      >
        {value || '–'}
        {showCheckIcon && (
          <span className={classNames(commonFormStyles.icon, styles.icon)}>
            <IconCheckCircleFill />
          </span>
        )}
      </span>
    </div>
  );
}

export default LabeledValue;
