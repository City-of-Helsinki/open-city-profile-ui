import React from 'react';

import styles from './LabeledValue.module.css';

type Props = {
  label: string;
  value: string | null | undefined;
};

function LabeledValue({ label, value }: Props) {
  return (
    <div className={styles.wrapper}>
      <strong className={styles.label}>{label}</strong>
      <span className={styles.value}>{value || '–'}</span>
    </div>
  );
}

export default LabeledValue;
