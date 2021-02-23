import { MyProfileQuery } from '../../graphql/generatedTypes';
import getCountry from './getCountry';

export default function getAddress(data: MyProfileQuery, lang: string): string {
  if (data.myProfile?.primaryAddress) {
    const address = data.myProfile.primaryAddress;
    const country = getCountry(address.countryCode, lang);

    return [address.address, address.city, address.postalCode, country]
      .filter(addressPart => addressPart)
      .join(', ');
  }
  return '';
}
