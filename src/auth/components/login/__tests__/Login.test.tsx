import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import TestLoginProvider from '../../../../common/test/TestLoginProvider';
import Login from '../Login';

const renderComponent = () =>
  render(
    <TestLoginProvider>
      <MemoryRouter initialEntries={['/']}>
        <Login />
      </MemoryRouter>
    </TestLoginProvider>
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
