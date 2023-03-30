import React from 'react';

import { useLoginClient } from './LoginContext';

type Props = {
  children: React.ReactNode | React.ReactNode[] | null;
  onSuccess: () => void;
  onError: (errorType: string) => void;
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
    .catch(() => {
      onError('unknown');
    });

  return <>{children}</>;
}

export default LoginCallbackHandler;
