#!/usr/bin/env ts-node-script
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */

/*
First set of country codes are from:
https://datahub.io/core/country-codes#javascript
Which exposes
https://pkgstore.datahub.io/core/country-codes/country-codes_json/
data/616b1fb83cbfd4eb6d9e7d52924bb00a/country-codes_json.json

This data set does not include for example Kosovo
This set has regional data which is used for removing sub regions from the data when their country code matches "parent"
Removed sub regions
  - Ahvenanmaa
  - Puerto Rico
So added second source
https://countrycode.org/countryCode/downloadCountryCodes

Finally found an up-to-date data set with possibility to scrape HTML
https://www.lincmad.com/countrycodes.html

There is excellent documentation. For example how Vatican does not use both country codes.
This data set is used as primary source of information.

Other possible sources
https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json
https://raw.githubusercontent.com/annexare/Countries/master/dist/countries.min.json

See also:
https://en.wikipedia.org/wiki/List_of_country_calling_codes

Missing country codes compared to the official ITU: https://www.itu.int/oth/T0202.aspx?parent=T0202
 - Ascension (+247) is not listed in i18n-iso-countries
 - Puerto Rico (+1 787, +1 939) is a subregion of US
- Jamaican second country code (+1658) is a new code and not listed in any sources.
  Jamaicans can use +1 (US) and add 658 if needed.
*/
import * as path from 'path';

import to from 'await-to-js';
import countries from 'i18n-iso-countries';

const CountryCodePropKey = 'ISO3166-1-Alpha-2';

type CountryDataJson = {
  [CountryCodePropKey]: string;
  Dial: string;
  is_independent: string | null;
};
// is_independent can be:
// null
// 'Yes'
// 'International'
// 'In contention'
// 'Territory of' | 'Part of' | 'Associated with' | ' Crown dependency of' | 'Commonwealth of' <Country Code>

type ParsedData = {
  [x: string]: string;
};

type Result = {
  [x: string]: string[];
};

type SubRegion = {
  countryCallingCode: string;
  regionCountryCallingCode: string;
  parentAlpha2Code: string;
};

type SubRegions = {
  [x: string]: SubRegion;
};

const fs = require('fs');
const { promisify } = require('util');

const fetch = require('node-fetch');

const writeFile = promisify(fs.writeFile);
const filePath = '../src/i18n/countryCallingCodes.json';
const resolvedPath: string = path.join(__dirname, filePath);

// Some lists include satellite country codes
const satelliteCountryCallingCodes = [
  '870',
  '871',
  '872',
  '873',
  '874',
  '875',
  '876',
  '877',
  '878',
  '879',
  '881',
];

function addPlusToCountryCallingCode(countryCallingCode: string): string {
  const add = (value: string) => `+${removeNonNumeric(value)}`;
  return countryCallingCode
    .split(',')
    .map(value => add(value))
    .join(',');
}

function removeNonNumeric(value: string): string {
  return value.replace(/\D/g, '');
}

function isSubRegion(valueOfIsIndependent: string): boolean {
  const value = valueOfIsIndependent ? valueOfIsIndependent.toLowerCase() : '';
  return !!(
    value &&
    value !== 'yes' &&
    value !== 'international' &&
    value !== 'in contention'
  );
}

// No need to list all non-independent regions.
// List only parent region when country codes are the same
function pickSubRegions(
  json: CountryDataJson[],
  jsonResult: ParsedData
): SubRegions {
  return json.reduce((current, countryData) => {
    if (countryData.is_independent && isSubRegion(countryData.is_independent)) {
      const alpha2 = countryData[CountryCodePropKey];
      const parentAlpha2Code = countryData.is_independent.split(' ').pop();
      const parentCountryCallingCode = parentAlpha2Code
        ? jsonResult[parentAlpha2Code]
        : '';
      const regionCountryCallingCode = jsonResult[alpha2];
      if (!parentCountryCallingCode) {
        throw new Error(`Unknown parent ${parentAlpha2Code}`);
      }
      current[alpha2] = {
        countryCallingCode: parentCountryCallingCode,
        parentAlpha2Code,
        regionCountryCallingCode,
      };
    }
    return current;
  }, {} as SubRegions);
}

// This removes sub-regions from the list. For example Åland
function isSubRegionWithMatchingCountryCallingCode(
  countryAlpha2Code: string,
  subRegions: SubRegions
): boolean {
  const subRegionData = subRegions[countryAlpha2Code];
  if (!subRegionData) {
    return false;
  }
  return (
    !subRegionData.regionCountryCallingCode ||
    subRegionData.countryCallingCode === subRegionData.regionCountryCallingCode
  );
}

function isSatelliteCountryCallingCode(countryCallingCode: string): boolean {
  return !!(
    countryCallingCode &&
    satelliteCountryCallingCodes.includes(removeNonNumeric(countryCallingCode))
  );
}

function mergeDataSetValues(valueSets: string[]): string[] {
  let merged: string[] = [];
  valueSets.forEach(valueSet => {
    merged = merged.concat(valueSet ? valueSet.split(',') : '');
  });
  return merged;
}

function pickByPriorityAndFilterSamePrefix(valueSet: string[]): string[] {
  const [primary, secondary, tertiary] = valueSet;
  if (primary) {
    return [primary];
  }
  if (secondary && tertiary && tertiary.includes(secondary)) {
    return [secondary];
  }
  return valueSet.filter(value => !!value);
}

function validateValues(valueSet: string[]): string[] {
  const values = valueSet
    .map(value => value.replace(/\s/g, ''))
    .filter(value => {
      if (isSatelliteCountryCallingCode(value)) {
        console.log(`###Removed ${value}. It is a satellite network.`);
        return false;
      }
      return true;
    });
  return Array.from(new Set(values));
}

function mergeDataSets(
  isoCountries: string[],
  dataSets: ParsedData[],
  subRegions: SubRegions
): Result {
  return isoCountries.reduce((result, countryAlpha2Code) => {
    if (
      isSubRegionWithMatchingCountryCallingCode(countryAlpha2Code, subRegions)
    ) {
      console.log(
        ` ### Removed ${countryAlpha2Code}! 
          ### It is a sub-region of ${subRegions[countryAlpha2Code].parentAlpha2Code} 
          ### and calling codes also match.`
      );
      return result;
    }

    const currentValues = dataSets.map(dataSet => dataSet[countryAlpha2Code]);
    if (countryAlpha2Code === 'KY') {
      console.log('!!!!', currentValues);
    }

    const addValuesToResult = (values: string[]): string[] => {
      const mergedAndFiltered = validateValues(
        pickByPriorityAndFilterSamePrefix(mergeDataSetValues(values))
      );
      if (mergedAndFiltered.length) {
        result[countryAlpha2Code] = mergedAndFiltered;
      }
      return mergedAndFiltered;
    };

    const added = addValuesToResult(currentValues);
    if (!added.length) {
      throw new Error(`Missing country code ${countryAlpha2Code}`);
    }

    return result;
  }, {} as Result);
}

function parseCsv(data: string): ParsedData {
  const rows: string[] = data.split('\n');
  rows.shift();
  return rows.reduce((result, nextRow) => {
    const splitData = nextRow.replace(/"/g, '').split(',');
    const alpha2 = splitData[1];
    const callingCode = splitData[8];
    if (!callingCode || !alpha2) {
      return result;
    }
    result[alpha2] = addPlusToCountryCallingCode(callingCode);
    return result;
  }, {} as ParsedData);
}

async function loadCsv(): Promise<ParsedData> {
  const [err, data] = await to(
    fetch('https://countrycode.org/countryCode/downloadCountryCodes')
  );
  if (err) {
    throw err;
  }
  const text = await (data as Response).text();
  return parseCsv(text);
}

async function loadJson() {
  const [err, data] = await to(
    fetch(
      // eslint-disable-next-line max-len
      'https://pkgstore.datahub.io/core/country-codes/country-codes_json/data/616b1fb83cbfd4eb6d9e7d52924bb00a/country-codes_json.json'
    )
  );
  if (err) {
    throw err;
  }
  return (data as Response).json();
}

function parseJson(data: CountryDataJson[]): ParsedData {
  const result: ParsedData = {};
  data.forEach(countryData => {
    const alpha2 = countryData[CountryCodePropKey];
    const dial = countryData['Dial'];
    if (!dial || !alpha2) {
      return;
    }
    result[alpha2] = addPlusToCountryCallingCode(dial);
  });
  return result;
}

function parseHtml(data: string): ParsedData {
  const pickerRegExp = /<!-- ([0-9]+ [A-Z]+) .+-->/g;
  const result: ParsedData = {};
  let regExpHit: string[] | null;
  while ((regExpHit = pickerRegExp.exec(data)) !== null) {
    const [, countryCallingCodeWithCountryCode] = regExpHit;
    const [
      countryCallingCode,
      countryCode,
    ] = countryCallingCodeWithCountryCode.split(' ');
    // Kyrgyzstan is falsely KY in this set. Should be KG
    if (countryCode !== 'KY') {
      result[countryCode] = addPlusToCountryCallingCode(countryCallingCode);
    }
  }
  return result;
}

async function loadHtml(): Promise<ParsedData> {
  const [err, data] = await to(
    fetch('https://www.lincmad.com/countrycodes.html')
  );
  if (err) {
    throw err;
  }
  const text = await (data as Response).text();
  return parseHtml(text);
}

function writeJSONFile(data: Result) {
  return writeFile(resolvedPath, JSON.stringify(data, null, 2), 'utf8');
}

const start = async () => {
  try {
    const csvCodes = await loadCsv();
    const json = await loadJson();
    const jsonCodes = parseJson(json);
    const htmlCodes = await loadHtml();
    const isoCountries = Object.keys(countries.getNames('en'));

    const result = mergeDataSets(
      isoCountries,
      [htmlCodes, jsonCodes, csvCodes],
      pickSubRegions(json, jsonCodes)
    );

    isoCountries.forEach(cc2 => {
      if (!result[cc2]) {
        console.log(
          `Missing country code for ${cc2}. Reason should be listed above with prefix "###".`
        );
      }
    });
    await writeJSONFile(result);
    console.log(`Created file ${filePath}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

start();
