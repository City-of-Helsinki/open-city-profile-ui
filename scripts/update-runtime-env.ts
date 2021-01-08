#!/usr/bin/env ts-node-script

import * as path from 'path';
import fs from 'fs';
import util from 'util';

// react-scipts config requires ENV to be set
const defaultNodeEnv = process.env.TEST ? 'test' : 'development';
// Prevent collision is app is running while tests are started
const configFile = process.env.TEST ? 'test-env-config.js' : 'env-config.js';

process.env.NODE_ENV=process.env.NODE_ENV || defaultNodeEnv;

const getClientEnvironment = require('../node_modules/react-scripts/config/env.js');


const configurationFile: string = path.join(__dirname, '../public/'+configFile);

const start = async () => {
  try {
    const envVariables = getClientEnvironment();
    fs.writeFile(configurationFile, 'window._env_ = ' + util.inspect(envVariables.raw, false, 2, false), function (err) {
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
