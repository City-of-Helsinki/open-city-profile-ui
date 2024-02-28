import React from 'react';
import { render } from '@testing-library/react';
import { ContentSource } from 'hds-react';
import { MemoryRouter } from 'react-router';
import { Mock } from 'vitest';

import CookieConsentPage from '../CookieConsentPage';
import MockCookieModal, {
  triggerOnConsentsParsed,
  triggeronAllConsentsGiven,
  setCookieConsents,
  verifyTrackingCookiesAreRemembered,
  verifyTrackingCookiesAreForgotten,
} from '../__mocks__/CookieModalAndPage';
import { trackingCookieId } from '../cookieContentSource';

vi.mock('hds-react', async () => {
  const module = await vi.importActual('hds-react');

  return {
    ...module,
    CookiePage: (props: { contentSource: ContentSource }) => (
      <MockCookieModal contentSource={props.contentSource} />
    ),
  };
});

describe('CookieConsentPage', () => {
  const pushTracker = vi.fn();
  const initialEnv = window._env_.REACT_APP_ENVIRONMENT;
  const renderComponent = () =>
    render(
      <MemoryRouter>
        <CookieConsentPage />
      </MemoryRouter>
    );
  beforeAll(() => {
    ((global.window as unknown) as { _paq: { push: Mock } })._paq = {
      push: pushTracker,
    };
    window._env_.REACT_APP_ENVIRONMENT = 'production';
  });
  afterAll(() => {
    window._env_.REACT_APP_ENVIRONMENT = initialEnv;
  });
  afterEach(() => {
    pushTracker.mockReset();
  });

  describe('renders HDS cookiePage and does not call onConsentsParsed because page does not track it.', () => {
    it('and tracking is disabled, if consent is not given.', async () => {
      const result = renderComponent();
      await triggerOnConsentsParsed(result);
      expect(pushTracker).toHaveBeenCalledTimes(0);
      expect(() =>
        result.getByTestId('mock-cookie-modal-and-page')
      ).not.toThrow();
    });
  });

  describe('renders HDS cookiePage and when onAllConsentsGiven is called', () => {
    it('tracking cookies are remembered, if consent is given', async () => {
      const result = renderComponent();
      await setCookieConsents(result, { [trackingCookieId]: true });
      await triggeronAllConsentsGiven(result);
      verifyTrackingCookiesAreRemembered(pushTracker);
    });
    it('tracking cookies are forgotten, if consent is not given', async () => {
      await triggeronAllConsentsGiven(renderComponent());
      verifyTrackingCookiesAreForgotten(pushTracker);
    });
  });
});
