import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import * as Sentry from '@sentry/browser';

import './index.css';
import BrowserApp from './BrowserApp';
import * as serviceWorker from './serviceWorker';

Modal.setAppElement('#root');

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
}

ReactDOM.render(<BrowserApp />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
