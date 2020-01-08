import React, { PropsWithChildren, ReactNode } from 'react';
import { Trans } from 'react-i18next';
import classNames from 'classnames';

import styles from './Checkbox.module.css';

type Props = PropsWithChildren<{
  onChange: () => void;
  label?: string;
  useTransComponent?: boolean;
  components?: Array<ReactNode>;
  i18Key?: string;
  className?: string;
}>;

function Checkbox(props: Props) {
  return (
    <div className={classNames(styles.container, props.className)}>
      <input
        className={styles.checkbox}
        type="checkbox"
        onChange={props.onChange}
      />
      <span className={styles.label}>
        {!props.useTransComponent && props.label}
        {props.useTransComponent && (
          <Trans i18nKey={props.i18Key} components={props.components} />
        )}
      </span>
    </div>
  );
}

export default Checkbox;
