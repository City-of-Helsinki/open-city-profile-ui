import countries from 'i18n-iso-countries';

import getLanguageCode from '../../common/helpers/getLanguageCode';
import { MyProfileQuery_myProfile_addresses_edges_node } from '../../graphql/generatedTypes';

export default function getCountry(
  countryCode:
    | MyProfileQuery_myProfile_addresses_edges_node['countryCode']
    | undefined,
  lang: string
): string {
  return countries.getName(countryCode || 'FI', getLanguageCode(lang));
}
