import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, render } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';

import PasswordChangeCallback from '../PasswordChangeCallback';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const module = await vi.importActual('react-router-dom');

  return {
    ...module,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      search: '',
    }),
  };
});

const renderComponent = () =>
  render(
    <MemoryRouter>
      <PasswordChangeCallback />
    </MemoryRouter>
  );

const getNavigateCallArgument = () => mockNavigate.mock.calls[0][0];

describe('<PasswordChangeCallback />', () => {
  afterEach(() => {
    mockNavigate.mockReset();
  });

  it('renders without error', async () => {
    renderComponent();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  it('should redirect user', async () => {
    renderComponent();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(getNavigateCallArgument()).toBe('/');
  });
});
