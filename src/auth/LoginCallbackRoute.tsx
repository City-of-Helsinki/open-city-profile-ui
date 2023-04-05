import React from 'react';
import { useHistory } from 'react-router-dom';

import LoginCallbackHandler from './LoginCallbackHandler';
import { useErrorPageRedirect } from '../profile/hooks/useErrorPageRedirect';

function LoginCallbackRoute(): React.ReactElement | null {
  const history = useHistory();
  const redirect = useErrorPageRedirect();
  const onSuccess = () => history.replace('/');
  const onError = (error?: Error) => {
    redirect({ title: 'Kirjautuminen epäonnistui', message: error?.message });
  };
  return (
    <LoginCallbackHandler onSuccess={onSuccess} onError={onError}>
      <div>Logging in</div>
    </LoginCallbackHandler>
  );
}

export default LoginCallbackRoute;
