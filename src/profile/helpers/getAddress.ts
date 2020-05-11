import countries from 'i18n-iso-countries';
import fi from 'i18n-iso-countries/langs/fi.json';
import en from 'i18n-iso-countries/langs/en.json';
import sv from 'i18n-iso-countries/langs/sv.json';

import { MyProfileQuery } from '../../graphql/generatedTypes';

countries.registerLocale(fi);
countries.registerLocale(en);
countries.registerLocale(sv);

export default function getAddress(data: MyProfileQuery, lang: string) {
  if (data.myProfile?.primaryAddress) {
    const address = data.myProfile.primaryAddress;
    return `${address.address}, ${address.city} ${
      address.postalCode
    } \n ${countries.getName(address.countryCode || 'FI', lang)}`;
  }
  return '';
}
