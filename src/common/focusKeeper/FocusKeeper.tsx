import React, { useEffect } from 'react';

import commonFormStyles from '../cssHelpers/form.module.css';

type Props = {
  targetId: string;
  children: React.ReactNode | React.ReactNode[];
  className?: string;
  autoFocus?: boolean;
};

const FocusKeeper = (props: Props): React.ReactElement => {
  const { children, className, targetId, autoFocus } = props;
  const moveFocusToTarget = React.useCallback(() => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
    }
  }, [targetId]);

  useEffect(() => {
    if (autoFocus) {
      moveFocusToTarget();
    }
  }, [autoFocus, moveFocusToTarget]);

  const HiddenTrapper = (): React.ReactElement => (
    <div
      className={commonFormStyles['visually-hidden']}
      tabIndex={0}
      role="button"
      aria-hidden
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
