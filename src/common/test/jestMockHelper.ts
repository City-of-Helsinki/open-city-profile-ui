export const getMockCallArgs = (
  mockFn: jest.Mock,
  argumentIndex = 0
): unknown[] => mockFn.mock.calls.map(call => call[argumentIndex]);

export const getAllLastMockCallArgs = (mockFn: jest.Mock): unknown[] => {
  const index = mockFn.mock.calls.length - 1;
  return mockFn.mock.calls[index];
};
