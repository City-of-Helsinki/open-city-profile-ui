/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import './common/test/testi18nInit';
import createFetchMock from 'vitest-fetch-mock';
import { vi } from 'vitest';

import '@testing-library/jest-dom/vitest';

// Load generated runtime configuration to be available in tests
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('../public/test-env-config');

window.scrollTo = vi.fn<any>();

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

vi.mock('react-router-dom', async () => {
  const module = await vi.importActual('react-router-dom');

  return {
    ...module,
    useLocation: () => ({
      pathname: '/',
    }),
  };
});

vi.mock('./auth/http-poller');

global.HTMLElement.prototype.scrollIntoView = vi.fn();

const originalError = console.error.bind(console.error);

console.error = (msg: any, ...optionalParams: any[]) => {
  const msgStr = msg.toString();

  return (
    !msgStr.includes('Could not parse CSS stylesheet') &&
    originalError(msg, ...optionalParams)
  );
};
