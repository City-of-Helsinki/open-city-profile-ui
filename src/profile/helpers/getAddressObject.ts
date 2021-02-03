import _ from 'lodash';
import countries from 'i18n-iso-countries';

import getLanguageCode from '../../common/helpers/getLanguageCode';
import {
  MyProfileQuery,
  MyProfileQuery_myProfile_addresses_edges_node,
} from '../../graphql/generatedTypes';

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
    const country = countries.getName(
      address.countryCode || 'FI',
      getLanguageCode(lang)
    );
    return _.assign(
      addressObject,
      address,
      { country },
      (a: AddressObject, b: AddressObject) => b || a
    );
  }
  return addressObject;
}
