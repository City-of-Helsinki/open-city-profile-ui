import { User } from 'oidc-client-ts';
import React from 'react';

import useAuth from './useAuth';

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

  const { getUser: authGetUser } = useAuth();

  React.useEffect(() => {
    let ignore = false;

    function getUser() {
      setIsLoading(true);

      authGetUser()
        .then(user => {
          if (ignore) {
            return;
          }
          setProfile(getUserProfile(user));
        })
        .catch(() => {
          if (ignore) {
            return;
          }

          setError(Error('User was not found'));
        })
        .finally(() => {
          if (ignore) {
            return;
          }

          setIsLoading(false);
        });
    }

    getUser();

    return () => {
      ignore = true;
    };
  }, [authGetUser]);

  return {
    profile,
    loading: isLoading,
    error,
  };
}

export default useProfile;
