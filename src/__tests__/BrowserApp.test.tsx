import React from 'react';
import { render } from '@testing-library/react';
import { Mock } from 'vitest';

import BrowserApp from '../BrowserApp';
import { getMockCallArgs } from '../common/test/mockHelper';

describe('BrowserApp', () => {
  const pushTracker = vi.fn();
  beforeAll(() => {
    ((global.window as unknown) as { _paq: { push: Mock } })._paq = {
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

  it('renders without crashing and commands tracker to wait for consent', () => {
    render(<BrowserApp />);

    const calls = getMockCallArgs(pushTracker) as string[];

    expect(calls).toEqual([
      ['requireCookieConsent'],
      ['requireConsent'],
      ['forgetCookieConsentGiven'],
      ['forgetConsentGiven'],
    ]);
  });
});
