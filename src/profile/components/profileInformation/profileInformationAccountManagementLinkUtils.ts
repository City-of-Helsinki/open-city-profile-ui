import {
  Profile,
  AMRStatic,
  tunnistusSuomifiAMR,
} from '../../../auth/useProfile';
import config from '../../../config';

export function getAmr(profile: Profile | null): AMRStatic | null {
  const amr = profile?.amr;

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

export function getAmrUrl(authenticationMethodReference: AMRStatic): string {
  switch (authenticationMethodReference) {
    case 'helsinkiAccount':
      return config.identityProviderManagementUrlHelsinki;
    case 'github':
      return config.identityProviderManagementUrlGithub;
    case 'google':
      return config.identityProviderManagementUrlGoogle;
    case 'facebook':
      return config.identityProviderManagementUrlFacebook;
    case 'yletunnus':
      return config.identityProviderManagementUrlYle;
    case 'tunnistusSuomifi':
      return config.identityProviderManagementUrlTunnistusSuomifi;
    default:
      throw Error(
        `Unexpected authentication method reference "${authenticationMethodReference}"`
      );
  }
}
