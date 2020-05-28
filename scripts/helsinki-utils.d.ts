declare module 'helsinki-utils/scripts/fetch-translations' {
  function fetchTranslations(
    sheetId: string,
    languages: string[],
    output: string,
    debug?: boolean
  ): Promise<never>;
  export = fetchTranslations;
}
