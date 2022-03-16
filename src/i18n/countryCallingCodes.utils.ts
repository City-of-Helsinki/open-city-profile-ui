import countries from 'i18n-iso-countries';
import _ from 'lodash';

import { AnyObject } from '../graphql/typings';
import countryCallingCodes from './countryCallingCodes.json';

export type CountryCallingCodeOption = { value: string; label: string };
type ParsedNumber = { countryCallingCode: string; number: string };
type SearchResult = { countryAlpha2Code?: string; countryCallingCode?: string };

export function getCallingCodesForCountryCode(
  list: AnyObject,
  cc2: string
): string[] {
  return list[cc2] as string[];
}

export function getCountryCallingCodes(
  uiLang: string
): CountryCallingCodeOption[] {
  const countryList = countries.getNames(uiLang);
  const resultList: CountryCallingCodeOption[] = [];
  const log = new Map<
    string,
    { countries: string[]; option: CountryCallingCodeOption }
  >();
  Object.keys(countryList).forEach(key => {
    const countryCallingCodesList = getCallingCodesForCountryCode(
      countryCallingCodes,
      key
    );
    if (!countryCallingCodesList) {
      return;
    }
    const countryName = countryList[key];
    countryCallingCodesList.forEach(value => {
      const option = {
        value,
        label: `${countryName} (${value})`,
      };
      const logEntry = log.get(value);
      if (logEntry) {
        logEntry.countries.push(countryName);
        logEntry.option.label = `${logEntry.countries.join(' & ')} (${value})`;
      } else {
        log.set(value, { countries: [countryName], option });
        resultList.push(option);
      }
    });
  });

  resultList.sort((a, b) => {
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  });
  return resultList;
}

export const getMemoizedCountryCallingCodes = _.memoize(getCountryCallingCodes);

export function getCountryAndCallingCodeForNumber(
  phoneNumber: string
): SearchResult {
  if (phoneNumber.indexOf('+') !== 0) {
    return {};
  }
  const results: SearchResult[] = [];
  Object.entries(countryCallingCodes).forEach(
    ([countryAlpha2Code, countryCallingCodeList]) => {
      const countryCallingCode = countryCallingCodeList.find(
        value => phoneNumber.indexOf(value) === 0
      );

      if (countryCallingCode) {
        results.push({
          countryAlpha2Code,
          countryCallingCode,
        });
      }
    }
  );
  if (results.length === 0) {
    return {};
  }
  if (results.length === 1) {
    return results[0];
  }
  return results.sort((a, b) => {
    const aCallingCodeLength = String(a.countryCallingCode).length;
    const bCallingCodeLength = String(b.countryCallingCode).length;
    if (aCallingCodeLength === bCallingCodeLength) {
      const aCountryCode = String(a.countryAlpha2Code);
      const bCountryCode = String(b.countryAlpha2Code);
      if (aCountryCode < bCountryCode) {
        return -1;
      }
      if (aCountryCode > bCountryCode) {
        return 1;
      }
      return 0;
    }
    return aCallingCodeLength < bCallingCodeLength ? 1 : -1;
  })[0];
}

export function splitNumberAndCountryCallingCode(
  phoneNumber: string
): ParsedNumber {
  const { countryCallingCode } = getCountryAndCallingCodeForNumber(phoneNumber);
  const number = countryCallingCode
    ? phoneNumber.substr(countryCallingCode.length)
    : phoneNumber;
  return {
    countryCallingCode: countryCallingCode || getDefaultCountryCallingCode(),
    number,
  };
}

export function getDefaultCountryCallingCode(): string {
  return countryCallingCodes['FI'][0];
}
