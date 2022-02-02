import getLanguageCode from '../../common/helpers/getLanguageCode';
import {
  ServiceConnectionsQueryVariables,
  TranslationLanguage,
} from '../../graphql/typings';

export default function createServiceConnectionsQueryVariables(
  langOrLangAndLocale: string
): ServiceConnectionsQueryVariables {
  return {
    language: getLanguageCode(
      langOrLangAndLocale
    ).toUpperCase() as TranslationLanguage,
  };
}
