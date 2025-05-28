import React, { useContext } from 'react';

import { ProfileContext } from '../../profile/context/ProfileContext';

function RenderChildrenWhenDataIsComplete({
  children,
}: {
  children: React.ReactElement | React.ReactNode[];
}): React.ReactElement | null {
  const { isComplete } = useContext(ProfileContext);
  if (!isComplete) {
    return null;
  }
  return <div data-testid='component-wrapper'>{children}</div>;
}

export default RenderChildrenWhenDataIsComplete;
