import { User } from 'oidc-client-ts';
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

export interface ProfileState {
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
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<Error | null>(null);

  const { getUser } = useOidcClient();

  React.useEffect(() => {
    function setup() {
      setIsLoading(true);

      const user = getUser();

      if (user) {
        setProfile(getUserProfile(user));
      } else {
        setError(Error('User was not found'));
      }

      setIsLoading(false);
    }

    setup();
  }, [getUser]);

  return {
    profile,
    loading: isLoading,
    error,
  };
}

export default useProfile;
