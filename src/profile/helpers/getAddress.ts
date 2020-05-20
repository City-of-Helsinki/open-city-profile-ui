import countries from 'i18n-iso-countries';

import { MyProfileQuery } from '../../graphql/generatedTypes';

export default function getAddress(data: MyProfileQuery, lang: string) {
  if (data.myProfile?.primaryAddress) {
    const address = data.myProfile.primaryAddress;
    const country = countries.getName(address.countryCode || 'FI', lang);

    return [address.address, address.city, address.postalCode, country].join(
      ', '
    );
  }
  return '';
}
