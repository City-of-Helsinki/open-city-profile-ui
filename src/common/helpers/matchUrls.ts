const addOriginIfMissing = (url: string) => {
  if (url.indexOf('http') !== 0) {
    const startsWithBackSlash = url.indexOf('/') === 0;
    return `${window.location.origin}${startsWithBackSlash ? '' : '/'}${url}`;
  }
  return url;
};

const trimSlashes = (path: string) => path.replace(/^\/|\/$/g, '');

function matchUrls(
  urlToFind: string,
  currentUrl?: string,
  { exactPaths = true }: { exactPaths?: boolean } = {}
): boolean {
  const current = new URL(
    currentUrl ? addOriginIfMissing(currentUrl) : window.location.href
  );
  const expectedMatch = new URL(addOriginIfMissing(urlToFind));
  if (current.origin !== expectedMatch.origin) {
    return false;
  }
  if (current.pathname !== expectedMatch.pathname) {
    if (!exactPaths) {
      if (
        trimSlashes(current.pathname) !== trimSlashes(expectedMatch.pathname)
      ) {
        return false;
      }
    } else {
      return false;
    }
  }
  if (expectedMatch.search) {
    const expectedParams = new URLSearchParams(expectedMatch.search);
    const currentParams = new URLSearchParams(current.search);
    const hasMismatch = Array.from(expectedParams).some(
      ([param, value]) => value !== currentParams.get(param)
    );
    if (hasMismatch) {
      return false;
    }
  }
  return true;
}

export default matchUrls;
