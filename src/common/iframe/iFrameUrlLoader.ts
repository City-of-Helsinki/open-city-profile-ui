function getIFrameByName(name: string) {
  return document.querySelector(`iframe[name=${name}]`) as HTMLIFrameElement;
}

export function iFrameUrlLoader<T = unknown>(
  url: string,
  name: string,
  dataValidator: (data: T) => boolean
): Promise<T> {
  let createdIFrame: HTMLIFrameElement | undefined;
  let observedIFrame: HTMLIFrameElement | undefined;
  let timeOutId: ReturnType<typeof setTimeout> | undefined;
  return new Promise((resolve, reject) => {
    const getOrigin = () =>
      window.location.protocol + '//' + window.location.host;

    const isEventInScope = (e: MessageEvent) => {
      if (!observedIFrame) {
        return false;
      }
      return (
        e.origin === getOrigin() && e.source === observedIFrame.contentWindow
      );
    };

    const postMessageListener = (e: MessageEvent) => {
      if (!observedIFrame) {
        return;
      }
      if (
        createdIFrame &&
        e.data &&
        e.data.cleanUpIFrameLoader &&
        e.data.iframeName === name
      ) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        cleanUp();
        reject(e.data);
        return;
      }
      if (!isEventInScope(e)) {
        return;
      }
      if (dataValidator(e.data)) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        cleanUp();
        resolve(e.data);
      }
    };

    const iFrameRemovedListener = (e: MessageEvent) => {
      if (e.data.iframeRemoved === true && e.data.iframeName === name) {
        observedIFrame = undefined;
        window.removeEventListener('message', postMessageListener, false);
        window.removeEventListener('message', iFrameRemovedListener, false);
        reject(e.data);
      }
    };

    const cleanUp = () => {
      window.removeEventListener('message', postMessageListener, false);
      if (createdIFrame) {
        // this message will actually be sent after all listeners of the postMessage
        // which triggered the cleanUp() are called
        // see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
        // so all postMessageListeners are called before iFrameRemovedListeners
        window.postMessage(
          { iframeRemoved: true, iframeName: name },
          location.origin
        );
        createdIFrame.remove();
        createdIFrame = undefined;
      }
      if (timeOutId) {
        clearTimeout(timeOutId);
        timeOutId = undefined;
      }
      observedIFrame = undefined;
    };

    const currentFrame = getIFrameByName(name);
    if (currentFrame) {
      observedIFrame = currentFrame;
      window.addEventListener('message', postMessageListener, false);
      window.addEventListener('message', iFrameRemovedListener, false);
      return;
    }
    createdIFrame = window.document.createElement('iframe');
    createdIFrame.style.visibility = 'hidden';
    createdIFrame.style.position = 'absolute';
    createdIFrame.style.top = '-1';
    createdIFrame.style.left = '-1';
    createdIFrame.width = '0';
    createdIFrame.height = '0';
    createdIFrame.tabIndex = -1;
    createdIFrame.name = name;
    window.document.body.appendChild(createdIFrame);

    observedIFrame = createdIFrame;

    const timeout = 10000;
    timeOutId = setTimeout(() => {
      cleanUp();
      reject(new Error('iFrame timeout'));
    }, timeout);

    window.addEventListener('message', postMessageListener, false);
    createdIFrame.src = url;
  });
}

export function cleanUpIFrame(name: string) {
  const iframe = getIFrameByName(name);
  if (!iframe) {
    return;
  }
  window.postMessage(
    { cleanUpIFrameLoader: true, iframeName: name },
    location.origin
  );
}
