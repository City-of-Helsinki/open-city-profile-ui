import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';
import { enableFetchMocks } from 'jest-fetch-mock';
import './common/test/testi18nInit';

enableFetchMocks();

// Load generated runtime configuration to be available in tests
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('../public/test-env-config');

configure({ adapter: new Adapter() });

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: () => ({
    pathname: '/',
  }),
}));
