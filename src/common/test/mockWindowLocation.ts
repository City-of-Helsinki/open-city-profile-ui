export type MockedWindowLocationActions = {
  restore: () => void;
  reset: () => void;
  getCalls: () => string[];
  getCallParameters: (index?: number) => URLSearchParams;
  setPath: (path: string) => void;
  setSearch: (path: string) => void;
  setOrigin: (path: string) => void;
};
export default function mockWindowLocation(): MockedWindowLocationActions {
  const globalWin = global as unknown as Window;
  let oldWindowLocation: Location | undefined = globalWin.location;
  let baseUrl = 'http://localhost';
  let path = '';
  let search = '';

  const unload = () =>
    setTimeout(() => window.dispatchEvent(new Event('unload')), 20);
  const tracker = vi.fn(unload);
  const location = Object.defineProperties(
    {},
    {
      ...Object.getOwnPropertyDescriptors(oldWindowLocation),
      assign: {
        enumerable: true,
        value: tracker,
      },
      replace: {
        enumerable: true,
        value: tracker,
      },
      href: {
        get: () => `${baseUrl}${path}${search ? '?' : ''}${search}`,
      },
      pathname: {
        get: () => path,
      },
      search: {
        get: () => search,
      },
      origin: {
        get: () => baseUrl,
      },
    }
  );
  Reflect.deleteProperty(globalWin, 'location');
  Reflect.defineProperty(globalWin, 'location', {
    configurable: true,
    value: location,
    writable: true,
  });

  const getCalls = () => tracker.mock.calls as unknown as string[];

  return {
    restore: () => {
      if (oldWindowLocation) {
        Reflect.defineProperty(globalWin, 'location', {
          configurable: true,
          value: oldWindowLocation,
          writable: true,
        });
      }
      oldWindowLocation = undefined;
    },
    reset: () => {
      tracker.mockClear();
      path = '';
      search = '';
      baseUrl = 'http://localhost';
    },
    setPath: (newPath: string) => {
      if (newPath.indexOf('/') !== 0) {
        throw new Error('Path must start with a backslash!');
      }
      path = newPath;
    },
    setSearch: (newSearch: string) => {
      search = newSearch;
    },
    setOrigin: (newBaseUrl: string) => {
      baseUrl = newBaseUrl;
    },
    getCalls,
    getCallParameters: (index = -1) => {
      const calls = getCalls();
      const arrIndex = index > -1 ? index : calls.length - 1;
      const call = calls[arrIndex];
      const args = call && call[0];
      if (!args) {
        return new URLSearchParams('');
      }
      return new URLSearchParams(args.substring(args.indexOf('?')));
    },
  };
}
