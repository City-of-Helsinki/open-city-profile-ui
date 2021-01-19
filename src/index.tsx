import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import * as Sentry from '@sentry/browser';

import './index.css';
import BrowserApp from './BrowserApp';
import * as serviceWorker from './serviceWorker';

Modal.setAppElement('#root');

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _env_: any;
  }
}

const ENVS_WITH_SENTRY = ['staging', 'production'];

if (
  window._env_.REACT_APP_ENVIRONMENT &&
  ENVS_WITH_SENTRY.includes(window._env_.REACT_APP_ENVIRONMENT)
) {
  Sentry.init({
    dsn: window._env_.REACT_APP_SENTRY_DSN,
    environment: window._env_.REACT_APP_ENVIRONMENT,
  });
}

ReactDOM.render(<BrowserApp />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
