import { User, UserProfile } from 'oidc-client-ts';

import { Profile } from '../../auth/useProfile';

export type MockedUserOverrides = {
  userOverrides?: Partial<User>;
  profileOverrides?: Omit<Partial<Profile>, 'amr'> & {
    amr?: string | string[];
  };
};

export function mockProfileCreator(
  overrides?: MockedUserOverrides['profileOverrides']
): Profile {
  return {
    amr: ['helsinki_tunnus-test'],
    auth_time: 1593431180,
    email: 'email@email.com',
    email_verified: false,
    family_name: 'Betty',
    given_name: 'Smith',
    name: 'Betty Smith',
    nickname: 'Betty',
    sub: 'uuidvalue',
    ...overrides,
  } as Profile;
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
    session_state: null,
    state: undefined,
    ...userOverrides,
    profile: mockProfileCreator(profileOverrides) as unknown as UserProfile,
  };
}
