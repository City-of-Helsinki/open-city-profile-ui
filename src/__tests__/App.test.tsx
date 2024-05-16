import React from 'react';
import { MemoryRouter } from 'react-router';
import { render } from '@testing-library/react';

import App from '../App';

it('renders without crashing', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
});
