import _ from 'lodash';

import getCountry from './getCountry';
import { ProfileRoot, AddressNode } from '../../graphql/typings';

type AddressObject = Pick<
  AddressNode,
  'address' | 'postalCode' | 'city' | 'countryCode'
> & { country: string };

export default function getAddress(
  data: ProfileRoot,
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
