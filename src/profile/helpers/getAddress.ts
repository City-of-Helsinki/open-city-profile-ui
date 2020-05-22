import countries from 'i18n-iso-countries';

import getLanguageCode from '../../common/helpers/getLanguageCode';
import { MyProfileQuery } from '../../graphql/generatedTypes';

export default function getAddress(data: MyProfileQuery, lang: string) {
  if (data.myProfile?.primaryAddress) {
    const address = data.myProfile.primaryAddress;
    const country = countries.getName(
      address.countryCode || 'FI',
      getLanguageCode(lang)
    );

    return [address.address, address.city, address.postalCode, country]
      .filter(addressPart => addressPart)
      .join(', ');
  }
  return '';
}
