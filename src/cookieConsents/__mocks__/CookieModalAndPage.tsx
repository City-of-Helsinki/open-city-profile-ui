import React from 'react';
import { RenderResult } from '@testing-library/react';
import { ContentSource } from 'hds-react';

import { AnyObject } from '../../graphql/typings';
import { getMockCallArgs } from '../../common/test/jestMockHelper';

export async function setCookieConsents(
  result: RenderResult,
  consents: AnyObject<boolean>
) {
  const el = await result.findByTestId('cookie-consents');
  if (!el) {
    throw new Error('No cookie-consents element');
  }
  el.textContent = JSON.stringify(consents);
}

export async function clickButton(result: RenderResult, testId: string) {
  const el = await result.findByTestId(testId);
  if (!el) {
    throw new Error('No trigger element');
  }
  el.click();
}

export async function triggerOnConsentsParsed(result: RenderResult) {
  return clickButton(result, 'trigger-on-consents-parsed');
}

export async function triggeronAllConsentsGiven(result: RenderResult) {
  return clickButton(result, 'trigger-on-all-consents-given');
}

export function verifyTrackingCookiesAreRemembered(mockFn: jest.Mock) {
  const calls = getMockCallArgs(mockFn) as string[];
  expect(calls).toEqual([
    ['rememberCookieConsentGiven'],
    ['rememberConsentGiven'],
  ]);
}

export function verifyTrackingCookiesAreForgotten(mockFn: jest.Mock) {
  const calls = getMockCallArgs(mockFn) as string[];
  expect(calls).toEqual([['forgetCookieConsentGiven'], ['forgetConsentGiven']]);
}

function CookieModalAndPageMock({
  contentSource,
}: {
  contentSource: ContentSource;
}) {
  const getConsents = (): AnyObject<boolean> => {
    const el = document.querySelector('*[data-testid="cookie-consents"]');
    if (!el || !el.textContent) {
      return {};
    }
    return JSON.parse(el.textContent);
  };
  const onConsentsParsedClick = () => {
    if (contentSource.onConsentsParsed) {
      contentSource.onConsentsParsed(getConsents(), false);
    }
  };
  const onAllConsentsGivenClick = () => {
    if (contentSource.onAllConsentsGiven) {
      contentSource.onAllConsentsGiven(getConsents());
    }
  };
  return (
    <div data-testid="mock-cookie-modal-and-page">
      <button
        type="button"
        data-testid="trigger-on-consents-parsed"
        onClick={onConsentsParsedClick}
      ></button>
      <button
        type="button"
        data-testid="trigger-on-all-consents-given"
        onClick={onAllConsentsGivenClick}
      ></button>
      <span data-testid="cookie-consents"></span>
    </div>
  );
}

export default CookieModalAndPageMock;
