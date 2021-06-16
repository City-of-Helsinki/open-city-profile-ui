import React from 'react';

import commonFormStyles from '../cssHelpers/form.module.css';

type Props = {
  targetId: string;
  children: React.ReactNode | React.ReactNode[];
  className?: string;
};

const FocusKeeper = (props: Props): React.ReactElement => {
  const { children, className, targetId } = props;
  const moveFocusToTarget = (e: unknown) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
    }
  };

  const HiddenTrapper = (): React.ReactElement => (
    <div
      className={commonFormStyles['visually-hidden']}
      tabIndex={0}
      onFocus={moveFocusToTarget}
    ></div>
  );

  return (
    <div className={className}>
      <HiddenTrapper />
      {children}
      <HiddenTrapper />
    </div>
  );
};

export default FocusKeeper;
