import { User } from 'oidc-client';
import React from 'react';
import { useOidcClient } from 'hds-react';

export const tunnistusSuomifiAMR = 'heltunnistussuomifi';

export type AMRStatic =
  | 'github'
  | 'google'
  | 'facebook'
  | 'yletunnus'
  | 'helsinkiAccount'
  | 'tunnistusSuomifi';

export interface Profile {
  amr: NonNullable<User['profile']['amr']>;
  auth_time: number;
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  name: string;
  nickname: string;
  sub: string;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
}

function getUserProfile(user: User | null): Profile | null {
  if (user === null || user.expired !== false) {
    return null;
  }
  const profile = { ...user.profile } as Profile;
  const amr = user.profile.amr;
  if (!amr) {
    profile.amr = [];
  } else if (typeof amr === 'string') {
    profile.amr = [amr];
  }
  return profile;
}

function useProfile(): ProfileState {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const { getUser } = useOidcClient();

  React.useEffect(() => {
    setProfile(getUserProfile(getUser() as User));
  }, [getUser]);

  return {
    profile,
    loading: false,
    error: null,
  };
}

export default useProfile;
