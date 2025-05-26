import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ErrorPage, { ErrorPageContent, ErrorPageQueryParams } from '../ErrorPage';
import i18n from '../../../../common/test/testi18nInit';
import config from '../../../../config';
import TestLoginProvider from '../../../../common/test/TestLoginProvider';
import * as useAuthMock from '../../../../auth/useAuth';

const mockUseLocationValue = {
  pathname: config.errorPagePath,
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

describe('<ErrorPage /> ', () => {
  const t = i18n.getFixedT('fi');
  const genericTitle = t('notification.defaultErrorTitle');
  const genericMessage = t('notification.defaultErrorText');
  let result: RenderResult;

  const getElementCount = (query: () => number): number => {
    try {
      return query();
    } catch {
      return 0;
    }
  };

  const getErrorsFromElementAndParamsMatch = (params: ErrorPageQueryParams | ErrorPageContent): string => {
    const titleElementCount = getElementCount(() => result.getAllByText(params.title || genericTitle).length);
    const messageElementCount = getElementCount(() => result.getAllByText(params.message || genericMessage).length);
    const loginButtonCount = getElementCount(() => result.getAllByTestId('error-page-login-button').length);
    const frontPageLinkCount = getElementCount(() => result.getAllByTestId('error-page-frontpage-link').length);

    const expectedLoginButtonCount = params.hideLoginButton === false || params.hideLoginButton === undefined ? 1 : 0;
    const expectedFrontPageLinkCount =
      params.hideFrontPageLink === false || params.hideFrontPageLink === undefined ? 1 : 0;
    if (titleElementCount !== 1) {
      return `There should be only one element with given title, but found ${titleElementCount}`;
    }
    if (messageElementCount !== 1) {
      return `There should be only one element with given message, but found ${messageElementCount}`;
    }

    if (loginButtonCount !== expectedLoginButtonCount) {
      return `hideLoginButton is '${params.hideLoginButton}' but number of buttons is ${loginButtonCount}`;
    }
    if (frontPageLinkCount !== expectedFrontPageLinkCount) {
      return `hideFrontPageLink is '${params.hideFrontPageLink}' but number of buttons is ${frontPageLinkCount}`;
    }

    return '';
  };

  it(`renders
      - generic title
      - generic message
      - the login button
      - the frontpage button
      when location.search is has no affecting params`, async () => {
    mockUseLocationValue.search = '';
    result = render(
      <TestLoginProvider>
        <MemoryRouter>
          <ErrorPage />
        </MemoryRouter>
      </TestLoginProvider>,
    );
    expect(getErrorsFromElementAndParamsMatch({})).toBe('');
  });
  it(`renders
      - given title
      - generic message
      - the login button
      - the frontpage button
      when location.search is has
      - a title
      and no other affecting params`, async () => {
    const title = 'test_title';
    mockUseLocationValue.search = `title=${title}`;
    result = render(
      <TestLoginProvider>
        <MemoryRouter>
          <ErrorPage />
        </MemoryRouter>
      </TestLoginProvider>,
    );
    expect(getErrorsFromElementAndParamsMatch({ title })).toBe('');
  });
  it(`renders
      - given title
      - given message
      - the login button
      - the frontpage button
      when location.search has
      - a title
      - a message
      and no other affecting params`, async () => {
    const title = 'test_title';
    const message = 'test_message';
    mockUseLocationValue.search = `title=${title}&message=${message}`;
    result = render(
      <TestLoginProvider>
        <MemoryRouter>
          <ErrorPage />
        </MemoryRouter>
      </TestLoginProvider>,
    );
    expect(getErrorsFromElementAndParamsMatch({ title, message })).toBe('');
  });
  it(`renders
      - given title
      - given message
      - no login button
      - the frontpage button
      when location.search has
      - a title
      - a message
      - hideLoginButton with a value
      and hideFrontPageLink is not set`, async () => {
    const title = 'test_title';
    const message = 'test_message';
    const hideLoginButton = 'anyValue';
    mockUseLocationValue.search = `title=${title}&message=${message}&hideLoginButton=${hideLoginButton}`;
    result = render(
      <MemoryRouter>
        <TestLoginProvider>
          <ErrorPage />
        </TestLoginProvider>
      </MemoryRouter>,
    );
    expect(
      getErrorsFromElementAndParamsMatch({
        title,
        message,
        hideLoginButton,
      }),
    ).toBe('');
  });
  it(`renders
      - given title
      - given message
      - no login button
      - no frontpage button
      when location.search has
      - a title
      - a message
      - hideLoginButton with a value
      - hideFrontPageLink with a value`, async () => {
    const title = 'test_title';
    const message = 'test_message';
    const hideLoginButton = 'anyValue';
    const hideFrontPageLink = 'anyValue';
    mockUseLocationValue.search = `title=${title}`;
    mockUseLocationValue.search += `&message=${message}`;
    mockUseLocationValue.search += `&hideLoginButton=${hideLoginButton}`;
    mockUseLocationValue.search += `&hideFrontPageLink=${hideFrontPageLink}`;
    result = render(
      <TestLoginProvider>
        <MemoryRouter>
          <ErrorPage />
        </MemoryRouter>
      </TestLoginProvider>,
    );
    expect(
      getErrorsFromElementAndParamsMatch({
        title,
        message,
        hideLoginButton,
        hideFrontPageLink,
      }),
    ).toBe('');
  });
  it(`renders
      - generic title
      - generic message
      - no login button
      - the frontpage button
      when location.search has no other affecting params, but user is authenticated`, async () => {
    mockUseLocationValue.search = '';

    vi.spyOn(useAuthMock, 'default').mockImplementationOnce(() => ({
      isAuthenticated: vi.fn().mockReturnValue(true),
      getUser: vi.fn(),
      endLogin: vi.fn(),
      logout: vi.fn(),
      login: vi.fn(),
      changePassword: vi.fn(),
      initiateTOTP: vi.fn(),
      disableTOTP: vi.fn(),
    }));

    result = render(
      <MemoryRouter>
        <TestLoginProvider>
          <ErrorPage />
        </TestLoginProvider>
      </MemoryRouter>,
    );
    expect(
      getErrorsFromElementAndParamsMatch({
        hideLoginButton: 'user is authenticated so this must be set to expect 0 login buttons',
      }),
    ).toBe('');
  });
  it(`uses "content"-prop and creates content from that even if url params are set`, async () => {
    const title = 'test_title';
    const message = 'test_message';
    const hideLoginButton = 'anyValue';
    const hideFrontPageLink = 'anyValue';
    mockUseLocationValue.search = `title=${title}`;
    mockUseLocationValue.search += `&message=${message}`;
    mockUseLocationValue.search += `&hideLoginButton=${hideLoginButton}`;
    mockUseLocationValue.search += `&hideFrontPageLink=${hideFrontPageLink}`;

    const content = {
      title: 'title in content',
      message: 'message in content',
      hideLoginButton: true,
      hideFrontPageLink: false,
    };

    result = render(
      <TestLoginProvider>
        <MemoryRouter>
          <ErrorPage content={content} />
        </MemoryRouter>
      </TestLoginProvider>,
    );
    expect(getErrorsFromElementAndParamsMatch(content)).toBe('');
  });
  it(`hides front page link and login button according to "content"-prop boolean values`, async () => {
    const title = 'test_title';
    const message = 'test_message';
    mockUseLocationValue.search = `title=${title}`;
    mockUseLocationValue.search += `&message=${message}`;

    const content = {
      title: 'title in content',
      message: 'message in content',
      hideLoginButton: true,
      hideFrontPageLink: true,
    };

    result = render(
      <TestLoginProvider>
        <MemoryRouter>
          <ErrorPage content={content} />
        </MemoryRouter>
      </TestLoginProvider>,
    );
    expect(getErrorsFromElementAndParamsMatch(content)).toBe('');
  });
});
