/* eslint-disable sonarjs/no-duplicate-string */
import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as MatomoTracker from '../MatomoTracker';
import { MatomoProvider } from '../matomo-context';
import useMatomo from '../hooks/useMatomo';

describe('useMatomo', () => {
  const MockedComponent = () => {
    const { trackPageView, trackEvent } = useMatomo();

    useEffect(() => {
      trackPageView({ href: 'https://www.hel.fi' });
    }, [trackPageView]);

    const mockTrackEvent = () =>
      trackEvent({ category: 'action', action: 'Test click track event' });

    return (
      <div>
        MockedComponent <button onClick={mockTrackEvent}>Click me</button>
      </div>
    );
  };

  it('should trackPageView', () => {
    const trackPageViewMock = vi.fn();

    vi.spyOn(MatomoTracker, 'default').mockImplementation(
      () =>
        ({
          trackPageView: trackPageViewMock,
        }) as unknown as MatomoTracker.default
    );

    // eslint-disable-next-line new-cap
    const instance = new MatomoTracker.default({
      urlBase: 'https://www.hel.fi',
      siteId: 'test123',
      srcUrl: 'test.js',
      enabled: true,
    });

    const MockProvider = () => (
      <MatomoProvider value={instance}>
        <MockedComponent />
      </MatomoProvider>
    );

    expect(MatomoTracker.default).toHaveBeenCalled();

    render(<MockProvider />);

    expect(trackPageViewMock).toHaveBeenCalledWith({
      href: 'https://www.hel.fi',
    });
  });

  it('should trackEvent', async () => {
    const trackPageViewMock = vi.fn();
    const trackEventMock = vi.fn();

    vi.spyOn(MatomoTracker, 'default').mockImplementation(
      () =>
        ({
          trackPageView: trackPageViewMock,
          trackEvent: trackEventMock,
        }) as unknown as MatomoTracker.default
    );

    // eslint-disable-next-line new-cap
    const instance = new MatomoTracker.default({
      urlBase: 'https://www.hel.fi',
      siteId: 'test123',
      srcUrl: 'test.js',
      enabled: true,
    });

    const MockProvider = () => (
      <MatomoProvider value={instance}>
        <MockedComponent />
      </MatomoProvider>
    );

    render(<MockProvider />);

    const user = userEvent.setup();

    await user.click(await screen.findByRole('button'));

    expect(trackEventMock).toHaveBeenCalledWith({
      category: 'action',
      action: 'Test click track event',
    });
  });
});
