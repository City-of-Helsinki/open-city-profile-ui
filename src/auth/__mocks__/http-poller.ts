import { HttpPoller, HttpPollerProps } from '../http-poller';

type MockHttpPollerData = {
  start: jest.Mock;
  stop: jest.Mock;
  props?: HttpPollerProps;
};

type GlobalWithPollerData = {
  mockHttpPoller: MockHttpPollerData;
};

const globalWithPollerData = (global as unknown) as GlobalWithPollerData;

if (!globalWithPollerData.mockHttpPoller) {
  globalWithPollerData.mockHttpPoller = {
    start: jest.fn(),
    stop: jest.fn(),
    props: undefined,
  };
}
const { mockHttpPoller } = globalWithPollerData;

export function getHttpPollerMockData(): MockHttpPollerData {
  return mockHttpPoller;
}

export default function createHttpPoller(
  pollerProps: HttpPollerProps
): HttpPoller {
  mockHttpPoller.start.mockReset();
  mockHttpPoller.stop.mockReset();
  mockHttpPoller.props = pollerProps;
  return {
    start: () => {
      mockHttpPoller.start();
    },
    stop: () => {
      mockHttpPoller.stop();
    },
  };
}
