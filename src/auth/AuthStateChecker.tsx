import React, { useMemo } from 'react';

import { useLoginStateListener } from './LoginContext';
import { LoginClientStateChange } from './login-client';

const AuthStateChecker = (): React.ReactElement | null => {
  const onStateListener = useMemo(
    () => (obj: LoginClientStateChange) => {
      console.log('onStateListener', obj);
    },
    []
  );
  const { state, previousState, error } = useLoginStateListener(
    onStateListener
  );
  return (
    <div>
      <p>State:{state}</p>
      <p>PreviousState:{previousState}</p>
      <p>Error:{error ? error.type : 'none'}</p>
    </div>
  );
};

export default AuthStateChecker;
