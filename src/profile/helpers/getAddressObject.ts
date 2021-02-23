import _ from 'lodash';

import {
  MyProfileQuery,
  MyProfileQuery_myProfile_addresses_edges_node,
} from '../../graphql/generatedTypes';
import getCountry from './getCountry';

type AddressObject = Pick<
  MyProfileQuery_myProfile_addresses_edges_node,
  'address' | 'postalCode' | 'city' | 'countryCode'
> & { country: string };

export default function getAddress(
  data: MyProfileQuery,
  lang: string
): AddressObject {
  const addressObject: AddressObject = {
    address: '',
    postalCode: '',
    city: '',
    countryCode: '',
    country: '',
  };
  if (data.myProfile?.primaryAddress) {
    const address = data.myProfile.primaryAddress;
    const country = getCountry(address.countryCode, lang);
    return _.assign(
      addressObject,
      address,
      { country },
      (a: AddressObject, b: AddressObject) => b || a
    );
  }
  return addressObject;
}
