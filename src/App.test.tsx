import React from 'react';
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router';

import App from './App';

it('renders without crashing', () => {
  shallow(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
});
