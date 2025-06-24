/* eslint-disable no-underscore-dangle */
import MatomoTracker, { MatomoTrackerOptions } from '../MatomoTracker';

describe('MatomoTracker', () => {
  it('should initialise window._paq', () => {
    window._paq = [];

    const intance = new MatomoTracker({
      urlBase: 'https://www.test.fi/',
      siteId: 'test123',
      srcUrl: 'test.js',
      enabled: true,
      configurations: {
        foo: 'bar',
        testArray: ['testArrayItem1', 'testArrayItem2'],
        testNoValue: undefined,
      },
    });

    expect(intance).toBeTruthy();
    expect(window._paq).toEqual([
      ['setTrackerUrl', 'https://www.test.fi/matomo.php'],
      ['setSiteId', 'test123'],
      ['foo', 'bar'],
      ['testArray', 'testArrayItem1', 'testArrayItem2'],
      ['testNoValue'],
      ['enableLinkTracking', true],
    ]);
  });

  it('should throw error if urlBase missing', () => {
    expect(
      () => new MatomoTracker({ siteId: 'test123' } as MatomoTrackerOptions)
    ).toThrowError();
  });

  it('should throw error if siteId missing', () => {
    expect(
      () =>
        new MatomoTracker({
          urlBase: 'https://www.test.fi',
        } as MatomoTrackerOptions)
    ).toThrowError();
  });
});
