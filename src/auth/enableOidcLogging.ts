import Oidc from 'oidc-client';

export default function() {
  Oidc.Log.logger = console;
}
