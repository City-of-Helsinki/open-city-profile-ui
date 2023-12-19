export const getMockCalls = (mockFn: jest.Mock) => mockFn.mock.calls;

export const getMockCallArgs = (
  mockFn: jest.Mock,
  argumentIndex = 0
): unknown[] => getMockCalls(mockFn).map(call => call[argumentIndex]);
