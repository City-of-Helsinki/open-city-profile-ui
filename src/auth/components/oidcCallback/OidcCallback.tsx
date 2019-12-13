import React from 'react';
import { CallbackComponent } from 'redux-oidc';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';

import userManager from '../../userManager';

type Props = {};

function OidcCallback(props: Props) {
  const history = useHistory();
  const onSuccess = (user: object) => {
    history.push('/');
  };
  const onError = (error: object) => {
    // TODO: do something about errors
    // eslint-disable-next-line no-console
    console.error(error);
  };
  const { t } = useTranslation();
  return (
    <CallbackComponent
      successCallback={onSuccess}
      errorCallback={onError}
      userManager={userManager}
    >
      <p>{t('oidc.authenticating')}</p>
    </CallbackComponent>
  );
}

export default OidcCallback;
