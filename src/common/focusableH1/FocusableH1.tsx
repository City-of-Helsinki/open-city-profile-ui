import React from 'react';
import classNames from 'classnames';

import commonStyles from '../cssHelpers/common.module.css';
import { pageLoadFocusTargetClassName } from '../../profile/hooks/usePageLoadFocusSetter';

type Props = {
  children: string;
} & React.HTMLAttributes<HTMLHeadingElement>;

export default function FocusableH1(props: Props): React.ReactElement {
  const { children, ...rest } = props;
  return (
    <h1
      {...rest}
      tabIndex={-1}
      className={classNames([
        pageLoadFocusTargetClassName,
        commonStyles['hide-focus-borders'],
      ])}
    >
      {children}
    </h1>
  );
}
