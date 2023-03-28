import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';
import { enableFetchMocks } from 'jest-fetch-mock';
import './common/test/testi18nInit';

enableFetchMocks();

// Load generated runtime configuration to be available in tests
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('../public/test-env-config');

configure({ adapter: new Adapter() });

((global as unknown) as Window).scrollTo = jest.fn();

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: () => ({
    pathname: '/',
  }),
}));

jest.mock('./auth/http-poller');

const unload = () =>
  setTimeout(() => window.dispatchEvent(new Event('unload')), 20);
const location = Object.defineProperties(
  {},
  {
    ...Object.getOwnPropertyDescriptors(window.location),
    assign: {
      enumerable: true,
      value: jest.fn(unload),
    },
    replace: {
      enumerable: true,
      value: jest.fn(unload),
    },
  }
);
Object.defineProperty(window, 'location', {
  enumerable: true,
  get: () => location,
});

global.HTMLElement.prototype.scrollIntoView = jest.fn();
