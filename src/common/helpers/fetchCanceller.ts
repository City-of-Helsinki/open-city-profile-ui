export function isAbortError(error: Error): boolean {
  return !!error && error.name === 'AbortError';
}

export function createFetchCanceller() {
  let isCancelled = false;
  let abortController: AbortController | undefined;
  const cancel = () => {
    if (isCancelled || !abortController) {
      return;
    }
    isCancelled = true;
    abortController.abort();
    abortController = undefined;
  };
  return {
    isCancelled: () => isCancelled,
    getSignal: () => {
      cancel();
      isCancelled = false;
      abortController = new AbortController();
      return abortController.signal;
    },
    cancel,
  };
}
