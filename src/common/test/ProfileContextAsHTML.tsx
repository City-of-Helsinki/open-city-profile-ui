import React, { useContext, useEffect, useRef, useState } from 'react';

import { ProfileContext } from '../../profile/context/ProfileContext';
import { getErrorMessage } from './testingLibraryTools';

function ProfileContextAsHTML(): React.ReactElement {
  const { data, isComplete, error, fetch, refetch } = useContext(
    ProfileContext
  );
  const [updateTime, setUpdateTime] = useState<number>(-1);
  const [dataUpdateTime, setDataUpdateTime] = useState<number>(-1);
  const errorMessage = getErrorMessage(error);
  const dataTracker = useRef<string>(JSON.stringify(data || {}));
  useEffect(() => {
    const dataAsString = JSON.stringify(data || {});
    if (dataAsString !== dataTracker.current) {
      dataTracker.current = dataAsString;
      setDataUpdateTime(Date.now());
    }
    setUpdateTime(Date.now());
  }, [data, errorMessage, isComplete]);
  const onButtonClick = () => (isComplete ? refetch() : fetch());
  return (
    <div data-testid="context-as-html">
      <div data-testid="context-as-html-isComplete">{String(isComplete)}</div>
      <div data-testid="context-as-html-error">{errorMessage}</div>
      <div data-testid="context-as-html-updateTime">{updateTime}</div>
      <div data-testid="context-as-html-dataUpdateTime">{dataUpdateTime}</div>
      <button onClick={onButtonClick} data-testid="context-as-html-fetch">
        Fetch
      </button>
    </div>
  );
}

export default ProfileContextAsHTML;
