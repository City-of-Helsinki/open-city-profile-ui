import React, { useContext, useState } from 'react';

import { ProfileContext } from '../../profile/context/ProfileContext';

function ProfileContextFetcher({
  children,
}: {
  children: React.ReactElement | React.ReactNodeArray;
}): React.ReactElement {
  const [fetchStarted, setFetchStarted] = useState(false);
  const { data, fetch } = useContext(ProfileContext);
  if (!fetchStarted) {
    fetch();
    setFetchStarted(true);
  }

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
