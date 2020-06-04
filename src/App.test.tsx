import React from 'react';
import { shallow } from 'enzyme';

import App from './App';
import { MemoryRouter } from 'react-router';

it('renders without crashing', () => {
  shallow(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
});
