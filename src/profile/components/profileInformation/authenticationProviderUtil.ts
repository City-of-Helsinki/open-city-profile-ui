import {
  Profile,
  AMRStatic,
  tunnistusSuomifiAMR,
} from '../../../auth/useProfile';
import config from '../../../config';
import { LoginMethodType, ProfileRoot } from '../../../graphql/typings';

function getAmrFromProfileData(profile: Profile | null): string | undefined {
  return profile && Array.isArray(profile.amr) ? profile.amr[0] : '';
}

export function getAmrStatic(profile: Profile | null): AMRStatic | null {
  const amr = getAmrFromProfileData(profile);

  // If amr designates helsinki account, switch the value into a static
  // value. This setup allows the amr for Helsinki account to be
  // configured, while allowing a static reference we can use for
  // translations for instance.
  if (amr === config.helsinkiAccountAMR) {
    return 'helsinkiAccount';
  }
  if (amr === tunnistusSuomifiAMR) {
    return 'tunnistusSuomifi';
  }

  if (
    amr === 'github' ||
    amr === 'google' ||
    amr === 'facebook' ||
    amr === 'yletunnus'
  ) {
    return amr;
  }

  // If amr doesn't match any of our expectations, return null.
  return null;
}

export function hasTunnistusSuomiFiAmr(profile: Profile | null): boolean {
  return getAmrFromProfileData(profile) === tunnistusSuomifiAMR;
}

export function hasHelsinkiAccountAMR(profile: Profile | null): boolean {
  return getAmrFromProfileData(profile) === config.helsinkiAccountAMR;
}

export function hasPasswordLogin(data: ProfileRoot | undefined): boolean {
  return (
    data?.myProfile?.loginMethods?.includes(LoginMethodType.PASSWORD) ?? false
  );
}
