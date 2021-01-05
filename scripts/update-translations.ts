#!/usr/bin/env ts-node-script
import * as path from 'path';

/// <reference types="./helsinki-utils" />
import fetchTranslations from 'helsinki-utils/scripts/fetch-translations';

const languages = process.env.TRANSLATION_LANGUAGES.split(',');
const sheetId = process.env.TRANSLATIONS_SHEET_ID;

const pathToLocales: string = path.join(__dirname, '../src/i18n');

const start = async () => {
  try {
    await fetchTranslations(sheetId, languages, pathToLocales);
    console.log('Done'); // eslint-disable-line
  } catch (err) {
    console.error(err.message); // eslint-disable-line
    process.exit(1);
  }
};

start();
