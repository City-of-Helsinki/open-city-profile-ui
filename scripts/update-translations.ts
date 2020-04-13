// copied from https://github.com/City-of-Helsinki/kukkuu-ui/blob/e927c46feeb8bad5dfe94e4f383bf240ac8ce51e/scripts/update-translations.ts
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import fetch from 'node-fetch';
// @ts-ignore
import * as i18nextConverter from 'i18next-json-csv-converter';

// Promises are more fun than callbacks
const writeFile = promisify(fs.writeFile);

const languages = process.env.TRANSLATION_LANGUAGES.split(',');
const project = process.env.TRANSLATION_PROJECT_NAME;
const sheetUrl = process.env.TRANSLATIONS_URL;

const pathToLocales: string = path.join(
  __dirname,
  '../src/i18n'
);

const getTranslations = async (language: string) => {
  const url = `${sheetUrl}tq?tqx=out:csv&sheet=${language}`;
  const res = await fetch(url);
  const body = await res.text();
  if (res.status !== 200) {
    throw Error(
      `Could not fetch ${language} translation data: ${res.status} ${res.statusText}`
    );
  }
  const translations = i18nextConverter.csv2Json(body);
  if (translations.sanityCheck !== `${project}.${language}`) {
    throw new Error(`Sanity check of ${language} translation failed, aborting`);
  }
  return translations;
};

const writeJSONFile = async (path: string, data: object) => {
  await writeFile(path, JSON.stringify(data, null, 2), 'utf8');
};

const fetchAll = async () => {
  await Promise.all(
    languages.map(async lang => {
      try {
        const res = await getTranslations(lang);
        await writeJSONFile(`${pathToLocales}/${lang}.json`, res);
      } catch (err) {
        throw err;
      }
    })
  );
};

const start = async () => {
  try {
    await fetchAll();
    console.log('Done'); // eslint-disable-line
  } catch (err) {
    console.error(err.message); // eslint-disable-line
    process.exit(1);
  }
};

start();
