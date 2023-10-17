import getLanguageCode from '../../common/helpers/getLanguageCode';
import {
  ServiceConnectionsQueryVariables,
  TranslationLanguage,
} from '../../graphql/typings';

export function convertStringToTranslationLanguage(
  langOrLangAndLocale: string
): TranslationLanguage {
  return getLanguageCode(
    langOrLangAndLocale
  ).toUpperCase() as TranslationLanguage;
}

export default function createServiceConnectionsQueryVariables(
  langOrLangAndLocale: string
): ServiceConnectionsQueryVariables {
  return {
    language: convertStringToTranslationLanguage(langOrLangAndLocale),
  };
}
