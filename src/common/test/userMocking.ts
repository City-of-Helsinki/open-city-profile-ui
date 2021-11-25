import { User, Profile as OidcProfile } from 'oidc-client';

import { Profile } from '../../auth/useProfile';

export type MockedUserOverrides = {
  userOverrides?: Partial<User>;
  profileOverrides?: Partial<Profile>;
};

export function mockProfileCreator(overrides?: Partial<Profile>): Profile {
  return {
    amr: 'helusername-test',
    auth_time: 1593431180,
    email: 'email@email.com',
    email_verified: false,
    family_name: 'Betty',
    given_name: 'Smith',
    name: 'Betty Smith',
    nickname: 'Betty',
    sub: 'uuidvalue',
    ...overrides,
  };
}

export function mockUserCreator({
  userOverrides,
  profileOverrides,
}: MockedUserOverrides = {}): User {
  const expirationTimeInMs = 100000;
  const scopes = ['openid', 'profile', 'https://api.hel.fi/foobar'];
  return {
    id_token: 'id_token',
    access_token: 'access_token',
    expires_at: Date.now() + expirationTimeInMs,
    scope: scopes.join(' '),
    token_type: 'bearer',
    expired: false,
    expires_in: expirationTimeInMs,
    scopes,
    toStorageString: () => 'storageString',
    refresh_token: undefined,
    session_state: undefined,
    state: undefined,
    ...userOverrides,
    profile: (mockProfileCreator(profileOverrides) as unknown) as OidcProfile,
  };
}
