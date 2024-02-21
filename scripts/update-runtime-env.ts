#!/usr/bin/env ts-node-script
import dotenv from 'dotenv';
import * as path from 'path';
import fs from 'fs';
import util from 'util';

/* @ts-ignore */
import.meta.env = {};

dotenv.config({
  processEnv: import.meta.env,
  path: [`.env.${process.env.NODE_ENV}`, '.env'],
});

// react-scipts config requires ENV to be set
const defaultNodeEnv = process.env.NODE_ENV ? 'test' : 'development';
// Prevent collision is app is running while tests are started

const configFile = process.env.TEST ? 'test-env-config.js' : 'env-config.js';

import.meta.env.NODE_ENV = import.meta.env.NODE_ENV || defaultNodeEnv;

const configurationFile: string = path.join(
  __dirname,
  '../public/' + configFile
);

const start = async () => {
  try {
    const envVariables = import.meta.env;

    fs.writeFile(
      configurationFile,
      'window._env_ = ' + util.inspect(envVariables, false, 2, false),
      function(err) {
        if (err) {
          return console.error(err);
        }
        console.log('File created!');
      }
    );
  } catch (err) {
    console.error(err.message); // eslint-disable-line
    process.exit(1);
  }
};

start();
