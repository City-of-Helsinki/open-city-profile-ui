import useServiceConnectionsAuthorizationCode from './useServiceConnectionsAuthorizationCode';

function useFetchKeycloakCode(): [() => void, boolean] {
  const [
    getAuthorizationCode,
    authorizationCodeStatus,
  ] = useServiceConnectionsAuthorizationCode({
    requiredGdprScope: 'query',
    idp: 'keycloak',
    deferredAction: 'useFetchKeycloakCode',
    onCompleted: e => {
      console.log('Keycloak code:', e);
      localStorage.setItem('keycloak_gdpr_code', e);
    },
    onError: () => {
      console.log('fetch keycloak code error');
    },
  });

  return [getAuthorizationCode, authorizationCodeStatus.loading];
}

export default useFetchKeycloakCode;
