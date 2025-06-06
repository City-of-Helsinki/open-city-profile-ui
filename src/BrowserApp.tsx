import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';

import App from './App';
import i18n from './i18n/i18nInit';

function BrowserApp(): React.ReactElement {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default BrowserApp;
