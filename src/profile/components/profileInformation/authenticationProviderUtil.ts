import { Amr } from 'hds-react';

import { AMRStatic, tunnistusSuomifiAMR } from '../../../auth/useProfile';
import config from '../../../config';
import { LoginMethodType, ProfileRoot } from '../../../graphql/typings';
import { MyLoginMethodNodeFragment } from '../../../graphql/generatedTypes';

function getAmrFromArray(amrArray: Amr | undefined): string | undefined {
  return amrArray && Array.isArray(amrArray) ? amrArray[0] : '';
}

export function getAmrStatic(amrArray: Amr | undefined): AMRStatic | null {
  const amr = getAmrFromArray(amrArray);

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

  // TODO: Should be removed soon
  if (amr === 'github' || amr === 'google' || amr === 'facebook' || amr === 'yletunnus') {
    return amr;
  }

  // If amr doesn't match any of our expectations, return null.
  return null;
}

export function hasTunnistusSuomiFiAmr(amrArray: Amr | undefined): boolean {
  return getAmrFromArray(amrArray) === tunnistusSuomifiAMR;
}

export function hasHelsinkiAccountAMR(amrArray: Amr | undefined): boolean {
  return getAmrFromArray(amrArray) === config.helsinkiAccountAMR;
}

export function hasPasswordLogin(data: ProfileRoot | undefined): boolean {
  return (
    data?.myProfile?.availableLoginMethods?.some((item) => item && item.method === LoginMethodType.PASSWORD) ?? false
  );
}

export function getMFALoginMethod(data: ProfileRoot | undefined): MyLoginMethodNodeFragment | undefined {
  const loginMethod = data?.myProfile?.availableLoginMethods?.find(
    (item) => item && item.method === LoginMethodType.OTP,
  );

  return loginMethod || undefined;
}

export function formatDate(dateString: string): string | null {
  const date = new Date(dateString);
  // Extract day, month, and year
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1);
  const year = date.getUTCFullYear();
  // Format to DD.MM.YYYY
  return `${day}.${month}.${year}`;
}
