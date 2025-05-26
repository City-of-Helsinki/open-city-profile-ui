import { Mock } from 'vitest';

export const getMockCalls = (mockFn: Mock) => mockFn.mock.calls;

export const getMockCallArgs = (mockFn: Mock, argumentIndex = 0): unknown[] =>
  getMockCalls(mockFn).map((call) => call[argumentIndex]);
