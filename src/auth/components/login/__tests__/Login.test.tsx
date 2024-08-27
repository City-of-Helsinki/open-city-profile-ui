import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import Login from '../Login';

const renderComponent = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('<Login />', () => {
  it('renders login page', () => {
    renderComponent();

    expect(screen.getByText('login.title')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'login.login' })
    ).toBeInTheDocument();
  });
});
