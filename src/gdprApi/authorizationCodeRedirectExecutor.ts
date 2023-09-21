import { gdprQueryScopeGetterAction } from './loadServiceConnectionsExecutor';
import { ActionExecutor } from './useActionQueue';
import gdprAuthCodeManager from './gdprAuthCodeManager';

export const authorizationRedirectionExecutor: ActionExecutor = (
  action,
  functions
) => {
  const scopes = functions.getResult(
    gdprQueryScopeGetterAction.type
  ) as string[];
  gdprAuthCodeManager.fetchAuthorizationCode('download', ['openid', ...scopes]);
  // get code
  return Promise.resolve();
};

export const authorizationRedirectParserExecutor2: ActionExecutor = () => {
  const code = gdprAuthCodeManager.authorizationCodeFetchCallback();
  return code ? Promise.reject(new Error('No code')) : Promise.resolve(code);
};
export const authorizationRedirectParserExecutor: ActionExecutor = async (
  action,
  queue
) =>
  new Promise((resolve, reject) => {
    (async () => {
      if (window.location.pathname !== '/gdpr-callback') {
        return;
      }
      const code = gdprAuthCodeManager.authorizationCodeFetchCallback();
      console.log('----code', code);
      if (code) {
        resolve(code);
      } else {
        reject(new Error('No code'));
      }
    })();
  });
