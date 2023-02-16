import React from 'react';
import classNames from 'classnames';

import commonStyles from '../cssHelpers/common.module.css';
import { pageLoadFocusTargetClassName } from '../../profile/hooks/usePageLoadFocusSetter';
import styles from './FocusableH1.module.css';

type Props = {
  children: string;
  useHeroStyle?: boolean;
} & React.HTMLAttributes<HTMLHeadingElement>;

export default function FocusableH1(props: Props): React.ReactElement {
  const { children, useHeroStyle = false, ...rest } = props;
  return (
    <h1
      {...rest}
      tabIndex={-1}
      className={classNames([
        pageLoadFocusTargetClassName,
        commonStyles['hide-focus-borders'],
        useHeroStyle && styles['hero-style'],
      ])}
    >
      {children}
    </h1>
  );
}
