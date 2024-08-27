import React from 'react';
import { render } from '@testing-library/react';
import { ContentSource } from 'hds-react';
import { Mock } from 'vitest';

import CookieConsentModal from '../CookieConsentModal';
import MockCookieModal, {
  triggerOnConsentsParsed,
  triggeronAllConsentsGiven,
  setCookieConsents,
  verifyTrackingCookiesAreRemembered,
  verifyTrackingCookiesAreForgotten,
  verifyTrackingCookiesAreNotSet,
} from '../__mocks__/CookieModalAndPage';
import { trackingCookieId } from '../cookieContentSource';
import config from '../../config';

vi.mock('hds-react', async () => {
  const module = await vi.importActual('hds-react');

  return {
    ...module,
    CookieModal: (props: { contentSource: ContentSource }) => (
      <MockCookieModal contentSource={props.contentSource} />
    ),
  };
});

const mockUseLocationValue = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};

vi.mock('react-router-dom', async () => {
  const module = await vi.importActual('react-router-dom');

  return {
    ...module,
    useLocation: vi.fn().mockImplementation(() => mockUseLocationValue),
  };
});

describe('CookieConsentModal', () => {
  const pushTracker = vi.fn();
  const initialEnv = window._env_.REACT_APP_ENVIRONMENT;
  const renderComponent = () => render(<CookieConsentModal />);
  beforeAll(() => {
    ((global.window as unknown) as { _paq: { push: Mock } })._paq = {
      push: pushTracker,
    };
    window._env_.REACT_APP_ENVIRONMENT = 'production';
  });
  afterEach(() => {
    mockUseLocationValue.pathname = '/';
    pushTracker.mockReset();
  });
  afterAll(() => {
    window._env_.REACT_APP_ENVIRONMENT = initialEnv;
  });
  describe('renders HDS cookieModal and calls onConsentsParsed', () => {
    it('and tracking is disabled, if consent is not given.', async () => {
      const result = renderComponent();
      await setCookieConsents(result, { [trackingCookieId]: false });
      await triggerOnConsentsParsed(result);
      verifyTrackingCookiesAreForgotten(pushTracker);
      expect(() =>
        result.getByTestId('mock-cookie-modal-and-page')
      ).not.toThrow();
    });
    it('and tracking is not yet set, if consent is given.', async () => {
      const result = renderComponent();
      await setCookieConsents(result, { [trackingCookieId]: true });
      await triggerOnConsentsParsed(result);
      verifyTrackingCookiesAreNotSet(pushTracker);
    });
  });

  describe('does not render HDS cookieModal', () => {
    it('if route is config.autoSSOLoginPath', async () => {
      mockUseLocationValue.pathname = config.autoSSOLoginPath;
      const result = renderComponent();
      expect(() => result.getByTestId('mock-cookie-modal-and-page')).toThrow();
      expect(pushTracker).toHaveBeenCalledTimes(0);
    });
  });

  describe('when modal is closed and onAllConsentsGiven is called', () => {
    it('tracking cookies are remembered, if consent is given', async () => {
      const result = renderComponent();
      await setCookieConsents(result, { [trackingCookieId]: true });
      await triggeronAllConsentsGiven(result);
      verifyTrackingCookiesAreRemembered(pushTracker);
    });
    it('tracking cookies are forgotten, if consent is not given', async () => {
      const result = renderComponent();
      await triggeronAllConsentsGiven(result);
      verifyTrackingCookiesAreNotSet(pushTracker);
    });
  });
});
