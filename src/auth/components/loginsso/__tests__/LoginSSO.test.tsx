import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import LoginSSO from '../LoginSSO';
import useAuth from '../../../useAuth';

vi.mock('../../../useAuth');

describe('<LoginSSO />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls login on mount and shows the authenticating indicator', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    (useAuth as Mock).mockReturnValue({ login });

    render(<LoginSSO />);

    expect(screen.getByText('oidc.authenticating')).toBeInTheDocument();
    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
  });

  it('swallows a rejected login promise without throwing', async () => {
    const login = vi.fn().mockRejectedValue(new Error('Navigation blocked'));
    (useAuth as Mock).mockReturnValue({ login });

    expect(() => render(<LoginSSO />)).not.toThrow();

    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
  });
});
