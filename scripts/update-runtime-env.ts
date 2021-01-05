#!/usr/bin/env ts-node-script

// /// <reference types="./helsinki-utils" />
// import fetchTranslations from 'helsinki-utils/scripts/fetch-translations';

// const languages = process.env.TRANSLATION_LANGUAGES.split(',');
// const sheetId = process.env.TRANSLATIONS_SHEET_ID;

// const pathToLocales: string = path.join(__dirname, '../src/i18n');

import * as path from 'path';
import fs from 'fs';
import util from 'util';
const getClientEnvironment = require('../node_modules/react-scripts/config/env.js');


const neededEnvVariablePrefixes: string[] = ["REACT_APP", "TRANSLATION"]
const condigurationFile: string = path.join(__dirname, '../public/env-config.js');

const start = async () => {
  try {
    const envVariables = getClientEnvironment()
    fs.writeFile(condigurationFile, 'window._env_ = ' + util.inspect(envVariables.raw, false, 2, false), function (err) {
      if (err) {
        return console.error(err);
      }
      console.log("File created!");
    });
  } catch (err) {
    console.error(err.message); // eslint-disable-line
    process.exit(1);
  }
};

start();
