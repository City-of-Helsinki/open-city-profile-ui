import getLanguageCode from '../../common/helpers/getLanguageCode';
import {
  ServiceConnectionsQueryVariables,
  TranslationLanguage,
} from '../../graphql/typings';

export default function createServiceConnectionsQueryVariables(
  langOrLangAndLocale: string,
  withGdprScopes = false
): ServiceConnectionsQueryVariables {
  return {
    language: getLanguageCode(
      langOrLangAndLocale
    ).toUpperCase() as TranslationLanguage,
    withGdprScopes,
  };
}
