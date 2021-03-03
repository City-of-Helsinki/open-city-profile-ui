import React from 'react';
import { IconCheckCircleFill } from 'hds-react';
import classNames from 'classnames';

import styles from './LabeledValue.module.css';
import commonFormStyles from '../cssHelpers/form.module.css';

type Props = {
  label: string;
  value: string | null | undefined;
  verifiedInfoText?: string;
};

function LabeledValue({
  label,
  value,
  verifiedInfoText,
}: Props): React.ReactElement {
  return (
    <div className={styles.wrapper}>
      <strong className={styles.label}>{label}</strong>
      <span
        className={classNames(
          styles.value,
          verifiedInfoText && styles.withIcon
        )}
      >
        {value || '–'}
        {verifiedInfoText && (
          <span className={classNames(commonFormStyles.icon, styles.icon)}>
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
