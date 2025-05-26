import React from 'react';
import { render } from '@testing-library/react';
import { Mock } from 'vitest';

import BrowserApp from '../BrowserApp';

describe('BrowserApp', () => {
  const pushTracker = vi.fn();
  beforeAll(() => {
    (global.window as unknown as { _paq: { push: Mock } })._paq = {
      push: pushTracker,
    };
  });

  beforeEach(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  it('renders without crashing', () => {
    render(<BrowserApp />);
  });
});
