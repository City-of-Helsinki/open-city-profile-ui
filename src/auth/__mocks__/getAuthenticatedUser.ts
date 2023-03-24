import { User } from 'oidc-client-ts';

const getAuthenticatedUser = (): Promise<Partial<User>> =>
  Promise.resolve({ access_token: 'foo.bar.baz' });
export default getAuthenticatedUser;
