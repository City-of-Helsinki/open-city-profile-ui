import React, { useContext, useEffect } from 'react';

import { ProfileContext } from '../../profile/context/ProfileContext';

function ProfileContextFetcher({
  children,
}: {
  children: React.ReactElement | React.ReactNode[];
}): React.ReactElement {
  const { data, fetch } = useContext(ProfileContext);

  useEffect(() => {
    fetch();
  });

  if (!data) {
    return <div data-testid="no-data-fetched"></div>;
  }
  return (
    <div data-testid="test-elements">
      <div data-testid="component">{children}</div>
    </div>
  );
}

export default ProfileContextFetcher;
