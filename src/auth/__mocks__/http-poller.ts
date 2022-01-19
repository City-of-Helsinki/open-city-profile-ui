import { HttpPoller, HttpPollerProps } from '../http-poller';

type MockHttpPollerData = {
  start: jest.Mock;
  stop: jest.Mock;
  props?: HttpPollerProps;
  actual?: HttpPoller;
  actualCreator?: (p: HttpPollerProps) => HttpPoller;
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

export function removeActualHttpPoller(): void {
  if (mockHttpPoller.actual) {
    mockHttpPoller.actual.stop();
  }
  mockHttpPoller.actual = undefined;
}

export function enableActualHttpPoller(httpPollerModule: {
  default: (props: HttpPollerProps) => HttpPoller;
}): void {
  removeActualHttpPoller();
  mockHttpPoller.actualCreator = httpPollerModule.default;
}

export function disableActualHttpPoller(): void {
  removeActualHttpPoller();
  mockHttpPoller.actualCreator = undefined;
}

export default function createHttpPoller(
  pollerProps: HttpPollerProps
): HttpPoller {
  mockHttpPoller.start.mockReset();
  mockHttpPoller.stop.mockReset();
  mockHttpPoller.props = pollerProps;
  if (mockHttpPoller.actualCreator) {
    mockHttpPoller.actual = mockHttpPoller.actualCreator(pollerProps);
  }
  return {
    start: () => {
      mockHttpPoller.start();
      if (mockHttpPoller.actual) {
        mockHttpPoller.actual.start();
      }
    },
    stop: () => {
      mockHttpPoller.stop();
      if (mockHttpPoller.actual) {
        mockHttpPoller.actual.stop();
      }
    },
  };
}
