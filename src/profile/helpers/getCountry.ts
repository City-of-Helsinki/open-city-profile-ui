import countries from 'i18n-iso-countries';

import getLanguageCode from '../../common/helpers/getLanguageCode';
import { AddressNode } from '../../graphql/typings';

export default function getCountry(countryCode: AddressNode['countryCode'] | undefined, lang: string): string {
  return countries.getName(countryCode || 'FI', getLanguageCode(lang)) as string;
}
