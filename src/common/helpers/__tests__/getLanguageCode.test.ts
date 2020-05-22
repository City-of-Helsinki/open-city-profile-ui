import getLanguageCode from '../getLanguageCode';

describe('getLanguageCode', () => {
  it('should always return language code', () => {
    expect(getLanguageCode('fi')).toEqual('fi');
    expect(getLanguageCode('fi-FI')).toEqual('fi');
  });
});
