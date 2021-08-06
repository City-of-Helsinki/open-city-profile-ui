import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ErrorPage, { ErrorPageQueryParams } from '../ErrorPage';
import i18n from '../../../../common/test/testi18nInit';
import authService from '../../../../auth/authService';
import config from '../../../../config';

const mockUseLocationValue = {
  pathname: config.errorPagePath,
  search: '',
  hash: '',
  state: null,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue),
}));

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

  const getErrorsFromElementAndParamsMatch = (
    params: ErrorPageQueryParams
  ): string => {
    const titleElementCount = getElementCount(
      () => result.getAllByText(params.title || genericTitle).length
    );
    const messageElementCount = getElementCount(
      () => result.getAllByText(params.message || genericMessage).length
    );
    const loginButtonCount = getElementCount(
      () => result.getAllByTestId('error-page-login-button').length
    );
    const frontPageLinkCount = getElementCount(
      () => result.getAllByTestId('error-page-frontpage-link').length
    );

    const expectedLoginButtonCount = params.hideLoginButton ? 0 : 1;
    const expectedFrontPageLinkCount = params.hideFrontPageLink ? 0 : 1;
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
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>
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
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>
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
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>
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
        <ErrorPage />
      </MemoryRouter>
    );
    expect(
      getErrorsFromElementAndParamsMatch({
        title,
        message,
        hideLoginButton,
      })
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
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>
    );
    expect(
      getErrorsFromElementAndParamsMatch({
        title,
        message,
        hideLoginButton,
        hideFrontPageLink,
      })
    ).toBe('');
  });
  it(`renders 
      - generic title
      - generic message  
      - no login button
      - the frontpage button
      when location.search has no other affecting params, but user is authenticated`, async () => {
    mockUseLocationValue.search = '';

    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);

    result = render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>
    );
    expect(
      getErrorsFromElementAndParamsMatch({
        hideLoginButton:
          'user is authenticated so this must be set to expect 0 login buttons',
      })
    ).toBe('');
  });
});
