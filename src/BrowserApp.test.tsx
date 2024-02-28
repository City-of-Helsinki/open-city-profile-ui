import React from 'react';
import { shallow } from 'enzyme';
import { Mock } from 'vitest';

import BrowserApp from './BrowserApp';
import { getMockCallArgs } from './common/test/mockHelper';

describe('BrowserApp', () => {
  const pushTracker = vi.fn();
  beforeAll(() => {
    ((global.window as unknown) as { _paq: { push: Mock } })._paq = {
      push: pushTracker,
    };
  });
  it('renders without crashing and commands tracker to wait for consent', () => {
    shallow(<BrowserApp />);
    const calls = getMockCallArgs(pushTracker) as string[];
    expect(calls).toEqual([['requireCookieConsent'], ['requireConsent']]);
  });
});
