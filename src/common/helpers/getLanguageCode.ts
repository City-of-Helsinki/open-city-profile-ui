function getLanguageCode(langOrLangAndLocale: string): string {
  const hasLocale = langOrLangAndLocale.includes('-');

  if (hasLocale) {
    return langOrLangAndLocale.split('-')[0];
  }

  return langOrLangAndLocale;
}

export default getLanguageCode;
