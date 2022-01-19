import { User } from 'oidc-client';

const getAuthenticatedUser = (): Promise<Partial<User>> =>
  Promise.resolve({ access_token: 'foo.bar.baz' });
export default getAuthenticatedUser;
