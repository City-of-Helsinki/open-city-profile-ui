import { formatDate } from '../authenticationProviderUtil';

describe('formatDate', () => {
  it('should return formatted date', () => {
    const dateString = '2025-01-17T12:49:12.518000+00:00';
    expect(formatDate(dateString)).toEqual('17.1.2025');
  });
});
