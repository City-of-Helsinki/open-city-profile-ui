import React from 'react';

import { useLoginClient } from './LoginContext';

type Props = {
  children: React.ReactNode | React.ReactNode[] | null;
  onSuccess: () => void;
  onError: (error?: Error) => void;
};

function LoginCallbackHandler({
  children,
  onSuccess,
  onError,
}: Props): React.ReactElement | null {
  const { handleCallback } = useLoginClient();

  handleCallback()
    .then(() => {
      onSuccess();
    })
    .catch(err => {
      onError(err);
    });

  return <>{children}</>;
}

export default LoginCallbackHandler;
