import countries from 'i18n-iso-countries';

import {
  getCallingCodesForCountryCode,
  getCountryAndCallingCodeForNumber,
  splitNumberAndCountryCallingCode,
  getCountryCallingCodes,
} from '../countryCallingCodes.utils';
import countryCallingCodes from '../countryCallingCodes.json';

describe('countryCallingCode.utils', () => {
  const countriesWithSingleCallingCodes = ['FI', 'DE', 'DK', 'SV', 'XK'];
  const countriesWithMultipleCallingCodes = ['DO'];
  const countriesWithMatchingCallingCodesInAlphabeticalOrder = ['CA', 'US'];
  const countriesWithPartialCallingCodesMatches = ['US', 'CA', 'DO'];
  const alphaBeticallyFirstCountryInMultipleHits =
    countriesWithMatchingCallingCodesInAlphabeticalOrder[0];
  const alphaBeticallyFirst = {
    countryAlpha2Code: alphaBeticallyFirstCountryInMultipleHits,
    countryCallingCodes: getCallingCodesForCountryCode(
      countryCallingCodes,
      alphaBeticallyFirstCountryInMultipleHits
    ),
  };
  describe('getCountryAndCallingCodeForNumber ', () => {
    it('returns an empty object when number has no listed country calling code', () => {
      expect(getCountryAndCallingCodeForNumber('')).toEqual({});
      expect(getCountryAndCallingCodeForNumber('35850100000')).toEqual({});
      expect(getCountryAndCallingCodeForNumber('3+5850100000')).toEqual({});
      expect(getCountryAndCallingCodeForNumber('+00000000')).toEqual({});
    });
    it('returns countryCallingCode and countryAlpha2Code when match is found from multiple countryCallingCodes', () => {
      [
        ...countriesWithMultipleCallingCodes,
        ...countriesWithSingleCallingCodes,
      ].forEach(countryAlpha2Code => {
        const callingCodesForCountry = getCallingCodesForCountryCode(
          countryCallingCodes,
          countryAlpha2Code
        );
        callingCodesForCountry.forEach(countryCallingCode => {
          expect(
            getCountryAndCallingCodeForNumber(`${countryCallingCode}1234567`)
          ).toEqual({
            countryCallingCode,
            countryAlpha2Code,
          });
        });
      });
    });
    it('if multiple countries have the same country calling code, return the first alphabetically', () => {
      countriesWithMatchingCallingCodesInAlphabeticalOrder.forEach(
        countryAlpha2Code => {
          const callingCodesForCountry = getCallingCodesForCountryCode(
            countryCallingCodes,
            countryAlpha2Code
          );
          callingCodesForCountry.forEach(countryCallingCode => {
            expect(
              getCountryAndCallingCodeForNumber(`${countryCallingCode}1234567`)
            ).toEqual({
              countryAlpha2Code: alphaBeticallyFirst.countryAlpha2Code,
              countryCallingCode: alphaBeticallyFirst.countryCallingCodes[0],
            });
          });
        }
      );
    });
    it(`if multiple countries have partially same country calling code,
        return the one with longest matching code (DO +1809 vs US +1).
        Or the first alphabetically
      `, () => {
      countriesWithPartialCallingCodesMatches.forEach(countryAlpha2Code => {
        const callingCodesForCountry = getCallingCodesForCountryCode(
          countryCallingCodes,
          countryAlpha2Code
        );
        const resultDependsOnAlphabeticalOrder = countriesWithMatchingCallingCodesInAlphabeticalOrder.includes(
          countryAlpha2Code
        );

        callingCodesForCountry.forEach(countryCallingCode => {
          const expectedResult = resultDependsOnAlphabeticalOrder
            ? {
                countryAlpha2Code: alphaBeticallyFirst.countryAlpha2Code,
                countryCallingCode: alphaBeticallyFirst.countryCallingCodes[0],
              }
            : {
                countryAlpha2Code,
                countryCallingCode,
              };
          expect(
            getCountryAndCallingCodeForNumber(`${countryCallingCode}1234567`)
          ).toEqual(expectedResult);
        });
      });
    });
  });
  describe('splitNumberAndCountryCallingCode returns an object with countryCallingCode and number and ', () => {
    const testNumbers = [
      '',
      '5012345678',
      'BE_can_have_chars',
      ' +358 _ +++',
      '+00000',
    ];
    it('+358 (FI) is default country calling code when a number has an unknown code. Number is not altered.', () => {
      const countryCallingCodesFI = countryCallingCodes['FI'][0];
      testNumbers.forEach(number => {
        expect(splitNumberAndCountryCallingCode(number)).toEqual({
          countryCallingCode: countryCallingCodesFI,
          number,
        });
      });
    });
    it('returns countryCallingCode and number without the country calling code when match is found', () => {
      [
        ...countriesWithMultipleCallingCodes,
        ...countriesWithSingleCallingCodes,
      ].forEach(countryAlpha2Code => {
        const callingCodesForCountry = getCallingCodesForCountryCode(
          countryCallingCodes,
          countryAlpha2Code
        );
        callingCodesForCountry.forEach(countryCallingCode => {
          testNumbers.forEach(number => {
            expect(
              splitNumberAndCountryCallingCode(`${countryCallingCode}${number}`)
            ).toEqual({
              countryCallingCode,
              number,
            });
          });
        });
      });
    });
    it(`if multiple countries have partially same country calling code,
        return the one with longest matching code (DO +1809 vs US +1).
        Or the first alphabetically
      `, () => {
      countriesWithPartialCallingCodesMatches.forEach(countryAlpha2Code => {
        const callingCodesForCountry = getCallingCodesForCountryCode(
          countryCallingCodes,
          countryAlpha2Code
        );
        const resultDependsOnAlphabeticalOrder = countriesWithMatchingCallingCodesInAlphabeticalOrder.includes(
          countryAlpha2Code
        );

        callingCodesForCountry.forEach(countryCallingCode => {
          const expectedCallingCode = resultDependsOnAlphabeticalOrder
            ? alphaBeticallyFirst.countryCallingCodes[0]
            : countryCallingCode;
          testNumbers.forEach(number => {
            expect(
              splitNumberAndCountryCallingCode(`${countryCallingCode}${number}`)
            ).toEqual({
              countryCallingCode: expectedCallingCode,
              number,
            });
          });
        });
      });
    });
  });
  describe('getCallingCodesForCountryCode ', () => {
    it('creates a list with calling codes and country name', () => {
      const list = getCountryCallingCodes('en');
      [
        ...countriesWithSingleCallingCodes,
        ...countriesWithMultipleCallingCodes,
      ].forEach(countryAlpha2Code => {
        const callingCodesForCountry = getCallingCodesForCountryCode(
          countryCallingCodes,
          countryAlpha2Code
        );
        callingCodesForCountry.forEach(countryCallingCode => {
          const option = list.find(item => item.value === countryCallingCode);
          const label = option?.label;
          expect(
            label?.includes(
              countries.getName(countryAlpha2Code, 'en') as string
            )
          ).toBeTruthy();
          expect(label?.includes(countryCallingCode)).toBeTruthy();
        });
      });
    });
  });
});
