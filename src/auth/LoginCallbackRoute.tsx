import React from 'react';
import { useHistory } from 'react-router-dom';

import LoginCallbackHandler from './LoginCallbackHandler';

function LoginCallbackRoute(): React.ReactElement | null {
  const history = useHistory();
  const onSuccess = () => history.replace('/');
  const onError = () => history.replace('/error');
  return (
    <LoginCallbackHandler onSuccess={onSuccess} onError={onError}>
      <div>Logging in</div>
    </LoginCallbackHandler>
  );
}

export default LoginCallbackRoute;
