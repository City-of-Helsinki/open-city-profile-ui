import React from 'react';
import classNames from 'classnames';
import { IconLocation, IconGlyphEuro, IconCalendar } from 'hds-react';

import styles from './LabeledValue.module.css';

type Props = {
  label: string;
  labelIcon?: 'location' | 'euro' | 'calendar';
  value: string | null | undefined;
  testId?: string;
};

function LabeledValue({
  label,
  value,
  testId,
  labelIcon,
}: Props): React.ReactElement {
  const labelTestId = testId ? { 'data-testid': `${testId}-label` } : null;
  const valueTestId = testId ? { 'data-testid': `${testId}-value` } : null;
  const Icon = () => {
    if (!labelIcon) {
      return null;
    }
    if (labelIcon === 'location') {
      return <IconLocation />;
    }
    if (labelIcon === 'euro') {
      return <IconGlyphEuro />;
    }
    if (labelIcon === 'calendar') {
      return <IconCalendar />;
    }
    return null;
  };
  return (
    <div className={styles['wrapper']}>
      <strong className={styles['label']} {...labelTestId}>
        <Icon /> {label}
      </strong>
      <span className={classNames(styles['value'])} {...valueTestId}>
        {value || '–'}
      </span>
    </div>
  );
}

export default LabeledValue;
