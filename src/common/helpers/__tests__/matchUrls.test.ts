import mockWindowLocation from '../../test/mockWindowLocation';
import matchUrls from '../matchUrls';

describe('matchUrls', () => {
  const mockedWindowControls = mockWindowLocation();

  afterAll(() => {
    mockedWindowControls.restore();
  });

  afterEach(() => {
    mockedWindowControls.reset();
  });

  const secureDomain = 'https://hel.fi';
  const insecureDomain = 'http://hel.fi';
  it('should return true when path is empty', () => {
    const emptyPaths = ['', '/', '?', '/?', '#', '/#', '?#', '/?#'];
    const crossCheckPaths = (paths: string[]) => {
      paths.forEach(path => {
        expect(matchUrls(path)).toBeTruthy();
        expect(matchUrls(path, path)).toBeTruthy();
        paths.forEach(otherPath => {
          expect(matchUrls(path, otherPath)).toBeTruthy();
        });
      });
    };
    crossCheckPaths(emptyPaths);
    mockedWindowControls.setOrigin(secureDomain);
    crossCheckPaths(emptyPaths.map(p => `${secureDomain}${p}`));
    mockedWindowControls.setOrigin(insecureDomain);
    crossCheckPaths(emptyPaths.map(p => `${insecureDomain}${p}`));
  });
  it('should return true when anchors mismatch', () => {
    const shouldMatchEachOther = ['/path', '/path#anchor1', '/path#anchor2'];
    shouldMatchEachOther.forEach(path => {
      mockedWindowControls.setPath(shouldMatchEachOther[0]);
      expect(matchUrls(path)).toBeTruthy();
      expect(matchUrls(path, path)).toBeTruthy();
    });
  });
  it('should add origin when it is not added', () => {
    const path = '/home/contacts/';
    mockedWindowControls.setOrigin(secureDomain);
    mockedWindowControls.setPath(path);
    expect(matchUrls(path)).toBeTruthy();
    expect(matchUrls(`${secureDomain}${path}`, path)).toBeTruthy();
    expect(matchUrls(path, `${secureDomain}${path}`)).toBeTruthy();
  });
  it('should differentiate origin protocols', () => {
    const path = '/home/contacts/';
    mockedWindowControls.setOrigin(secureDomain);
    mockedWindowControls.setPath(path);
    expect(matchUrls(path, `${insecureDomain}${path}`)).toBeFalsy();
    expect(
      matchUrls(`${secureDomain}${path}`, `${insecureDomain}${path}`)
    ).toBeFalsy();
  });
  it('should return true when paths have mismatching backslashes and exactPaths option is false', () => {
    const shouldMatchEachOther = [
      '/pathA/pathB',
      '/pathA/pathB/',
      'pathA/pathB/',
    ];
    shouldMatchEachOther.forEach(path => {
      mockedWindowControls.setPath(shouldMatchEachOther[0]);
      expect(matchUrls(path, undefined, { exactPaths: false })).toBeTruthy();
      expect(
        matchUrls(path, shouldMatchEachOther[1], { exactPaths: false })
      ).toBeTruthy();
      expect(
        matchUrls(path, shouldMatchEachOther[2], { exactPaths: false })
      ).toBeTruthy();
    });
  });
  it('should return false when paths have mismatching backslashes and exactPaths option is true (default)', () => {
    const shouldNotMatchEachOther = [
      '/pathA/pathB',
      '/pathA/pathB/',
      'pathA/pathB/',
      'pathA/pathB/?',
      'pathA/pathB/#',
    ];
    mockedWindowControls.setPath(shouldNotMatchEachOther[0]);
    expect(matchUrls(shouldNotMatchEachOther[1], undefined)).toBeFalsy();
    expect(
      matchUrls(shouldNotMatchEachOther[0], shouldNotMatchEachOther[1])
    ).toBeFalsy();
    expect(
      matchUrls(shouldNotMatchEachOther[2], shouldNotMatchEachOther[0])
    ).toBeFalsy();
    // note [2] and [1] match because slashes are added when merging missing origins to the path.
  });
  it('should return false when paths mismatch', () => {
    const shouldNotMatchEachOther = ['/pathA', '/pathAB', '/path', '/'];
    shouldNotMatchEachOther.forEach(pathA => {
      shouldNotMatchEachOther.forEach(pathB => {
        if (pathA === pathB) {
          return;
        }
        expect(matchUrls(pathA, pathB)).toBeFalsy();
        expect(matchUrls(`${secureDomain}${pathA}`, pathB)).toBeFalsy();
        expect(
          matchUrls(`${secureDomain}${pathA}`, `${secureDomain}${pathB}`)
        ).toBeFalsy();
      });
    });
  });
  it('should return true when all search param values match, but total number of params mismatch.', () => {
    const path = '/path';
    const params = ['a=AA', 'b=Bee', 'one=1', 'x=%2f%20'];
    const hasAllParams = `${path}?extra=1&${params.join('&')}#anchor=1`;
    params.forEach(param => {
      expect(matchUrls(`${path}?${param}`, hasAllParams)).toBeTruthy();
      expect(matchUrls(path, hasAllParams)).toBeTruthy();
      expect(
        matchUrls(`${path}/?${param}#anchor=2`, hasAllParams, {
          exactPaths: false,
        })
      ).toBeTruthy();
    });
  });
  it('should return false when all search param do not match', () => {
    expect(matchUrls(`/p?a=a`, `/p?a=b`)).toBeFalsy();
    expect(matchUrls(`/p?a=a&b=b`, `/p?a=a&b=c`)).toBeFalsy();
    expect(matchUrls(`/p?a=a&b=b`, `/p?a=a`)).toBeFalsy();
  });
});
