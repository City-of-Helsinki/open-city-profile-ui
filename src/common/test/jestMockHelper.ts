export const getMockCallArgs = (
  mockFn: jest.Mock,
  argumentIndex = 0
): unknown[] => mockFn.mock.calls.map(call => call[argumentIndex]);
