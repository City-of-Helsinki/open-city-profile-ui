import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  act,
  RenderResult,
} from '@testing-library/react';

import { cleanUpIFrame, iFrameUrlLoader } from '../iFrameUrlLoader';

describe('iFrameUrlLoader', () => {
  const iFrameUrl = 'this-does-not-matter-in-jsdom.html';
  const iFrameName = 'testIFrame';
  const defaultMessageData = {
    message: 'hello',
  };
  // match this with the value in iFrameUrlLoader
  const iFrameTimeout = 30000;

  let promise: Promise<unknown> | undefined;
  const successListener = jest.fn();
  const errorListener = jest.fn();
  const messageDataValidatorListener = jest.fn();

  const defaultMessageValidator = (data: unknown) => {
    messageDataValidatorListener(data);
    return true;
  };

  const nonResolvingMessageValidator = (data: unknown) => {
    messageDataValidatorListener(data);
    return false;
  };

  const sendWindowMessage = (props: MessageEventInit) => {
    fireEvent(window, new MessageEvent('message', props));
  };

  const getIFrameFromResult = (result: RenderResult, name?: string) => {
    const selector = name ? `iframe[name=${name}]` : 'iframe';
    return result.baseElement.querySelectorAll(
      selector
    )[0] as HTMLIFrameElement;
  };

  const getMessageOriginAndSource = (
    iframe: HTMLIFrameElement
  ): Pick<MessageEventInit, 'origin' | 'source'> => ({
    origin: window.location.origin,
    source: iframe.contentWindow,
  });

  const Component = ({
    messageDataValidator,
  }: {
    messageDataValidator: (e: unknown) => boolean;
  }) => {
    promise = iFrameUrlLoader<unknown>(
      iFrameUrl,
      iFrameName,
      messageDataValidator
    )
      .then(data => {
        successListener(data);
        promise = undefined;
      })
      .catch(e => {
        errorListener(e);
        promise = undefined;
      });
    return <div data-testid="iframe-div">Iframe creator</div>;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
  });

  afterEach(async () => {
    jest.advanceTimersByTime(iFrameTimeout * 2);
    // make sure a new test is not run until the previous one is fulfilled
    await waitFor(() => {
      if (
        successListener.mock.calls.length === 0 &&
        errorListener.mock.calls.length === 0
      ) {
        throw new Error('Promise not finished!');
      }
    });
    jest.useRealTimers();
  });

  const initTests = (
    messageValidator: Parameters<
      typeof iFrameUrlLoader
    >[2] = defaultMessageValidator
  ): {
    result: RenderResult;
    root: HTMLElement;
    getIFrame: () => HTMLIFrameElement;
    sendMessage: (props?: Partial<MessageEventInit>) => void;
  } => {
    const result = render(
      <Component messageDataValidator={messageValidator} />
    );
    const root = result.baseElement;
    const getIFrame = () => getIFrameFromResult(result);
    const sendMessage = (props?: Partial<MessageEventInit>) => {
      sendWindowMessage({
        data: defaultMessageData,
        ...getMessageOriginAndSource(getIFrame()),
        ...props,
      });
    };
    return {
      result,
      root,
      getIFrame,
      sendMessage,
    };
  };

  describe('Given url is loaded and a promise is returned', () => {
    it('iframe is created and its src matches the url and a promise was returned', async () => {
      await act(async () => {
        const { getIFrame } = initTests();
        const iframe = getIFrame();
        expect(iframe).not.toBeNull();
        expect(iframe.src).toBe(`${window.location}${iFrameUrl}`);
        expect(promise && promise.then).toBeDefined();
      });
    });
  });

  describe('The given data validator', () => {
    it(`is called only when message.origin and message.source matches the iframe`, async () => {
      await act(async () => {
        const { getIFrame, sendMessage } = initTests(
          nonResolvingMessageValidator
        );
        const iframe = getIFrame();
        sendMessage();
        expect(messageDataValidatorListener).toHaveBeenCalledTimes(1);

        sendMessage();
        expect(messageDataValidatorListener).toHaveBeenCalledTimes(2);

        sendMessage({
          source: (iframe as unknown) as MessageEventSource,
        });
        expect(messageDataValidatorListener).toHaveBeenCalledTimes(2);

        sendMessage({
          origin: 'http://hel.fi',
        });
        expect(messageDataValidatorListener).toHaveBeenCalledTimes(2);
      });
    });
    it('is called with given message.data', async () => {
      await act(async () => {
        const { sendMessage } = initTests();

        sendMessage({
          data: defaultMessageData,
        });

        expect(messageDataValidatorListener).toHaveBeenLastCalledWith(
          defaultMessageData
        );
      });
    });
    it('can be called multiple times, if it does not return true and then resolve the promise', async () => {
      let returnedValue = false;
      const validator = (data: unknown) => {
        messageDataValidatorListener(data);
        return returnedValue;
      };
      await act(async () => {
        const { getIFrame } = initTests(validator);
        const iframe = getIFrame();
        // caching iframe because it is removed when promise is fulfilled
        // therefore sendMessage would fail as it won't find iframe when calling getMessageOriginAndSource
        const sendMessageWithCachedIFrame = () => {
          sendWindowMessage({
            origin: window.location.origin,
            source: iframe.contentWindow,
            data: defaultMessageData,
          });
        };
        sendMessageWithCachedIFrame();
        sendMessageWithCachedIFrame();
        sendMessageWithCachedIFrame();
        expect(messageDataValidatorListener).toHaveBeenCalledTimes(3);
        returnedValue = true;
        // the validator is called once more because promise is not resolved.
        sendMessageWithCachedIFrame();
        expect(messageDataValidatorListener).toHaveBeenCalledTimes(4);
        // now the promise is resolved.
        sendMessageWithCachedIFrame();
        expect(messageDataValidatorListener).toHaveBeenCalledTimes(4);
      });
    });
  });
  describe('iFrameUrlLoader is teared down when data validator returns true', () => {
    it('iFrame is removed and promise is fulfilled', async () => {
      await act(async () => {
        const { root, sendMessage } = initTests();

        expect(root.querySelectorAll('iframe')[0]).not.toBeUndefined();
        sendMessage();

        await waitFor(() => {
          expect(root.querySelectorAll('iframe')[0]).toBeUndefined();
          expect(successListener).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
  describe('Promise is rejected when iframe timeout expires', () => {
    it('iframe is removed and errorListener is called with an error object', async () => {
      await act(async () => {
        const { getIFrame } = initTests();
        expect(successListener).toHaveBeenCalledTimes(0);
        expect(errorListener).toHaveBeenCalledTimes(0);
        expect(getIFrame()).not.toBeUndefined();
        jest.advanceTimersByTime(iFrameTimeout * 2);
        await waitFor(() => {
          expect(errorListener).toHaveBeenCalledTimes(1);
          expect(errorListener.mock.calls[0][0] instanceof Error).toBeTruthy();
          expect(successListener).toHaveBeenCalledTimes(0);
        });
        expect(getIFrame()).toBeUndefined();
      });
    });
  });
  describe('iFrameUrlLoader can be aborted by sending a certain message', () => {
    it('Message data must be {cleanUpIFrameLoader:true, name:<name of the iframe>}', async () => {
      await act(async () => {
        // must use real timers here or for some reason the message won't go through
        // most likely because "jsdom fire the message event inside a setTimeout" (reported in StackOverflow)
        jest.useRealTimers();
        const { getIFrame } = initTests(nonResolvingMessageValidator);
        expect(successListener).toHaveBeenCalledTimes(0);
        expect(errorListener).toHaveBeenCalledTimes(0);
        cleanUpIFrame(iFrameName);
        await waitFor(() => {
          expect(getIFrame()).toBeUndefined();
          expect(errorListener).toHaveBeenLastCalledWith({
            cleanUpIFrameLoader: true,
            iframeName: iFrameName,
          });
        });
      });
      // must set this back because jest.advanceTimersByTime() is called in afterEach()
      // there seems to be no way to detect if fake timers are in use or not
      jest.useFakeTimers();
    });
  });
  describe('Multiple iFrameUrlLoaders can co-exist', () => {
    const component1Tracker = jest.fn();
    const component2Tracker = jest.fn();
    const component3Tracker = jest.fn();

    const doNotResolveData = { resolve: false };
    const resolveData = { resolve: true };
    const frame1Name = 'frame1';
    const frame2Name = 'frame2';
    const frame3Name = 'frame3';

    const verifyTrackerReceivedAnEvent = (
      tracker: jest.Mock,
      props: Record<string, unknown>
    ) => {
      const calls = tracker.mock.calls;
      return (
        calls.findIndex(args => {
          try {
            expect(args[0]).toMatchObject(props);
            return true;
          } catch (e) {
            return false;
          }
        }) > -1
      );
    };

    const didTrackerReceiveIFrameRemovedMessage = (
      tracker: jest.Mock,
      iframeName: string
    ) =>
      verifyTrackerReceivedAnEvent(tracker, {
        iframeRemoved: true,
        iframeName,
      });

    const didTrackerReceiveCleanUpMessage = (
      tracker: jest.Mock,
      iframeName: string
    ) =>
      verifyTrackerReceivedAnEvent(tracker, {
        cleanUpIFrameLoader: true,
        iframeName,
      });

    const MultiIFrameComponent = ({
      name,
      tracker,
    }: {
      name: string;
      tracker: jest.Mock;
    }) => {
      iFrameUrlLoader<unknown>(iFrameUrl, name, e => {
        tracker(e);
        return (e as { resolve: boolean }).resolve;
      })
        .then(data => {
          tracker(data);
          successListener(data);
        })
        .catch(e => {
          tracker(e);
          errorListener(e);
        });
      return <div data-testid="iframe-div">Iframe creator</div>;
    };
    describe('Loaders with same name are connected and', () => {
      it('When cleanUpIFrame() is called, the first created iframe will message others to cleanUp', async () => {
        // again useRealTimers is required when using cleanUpIFrame()
        jest.useRealTimers();
        await act(async () => {
          const result = render(
            <div>
              <MultiIFrameComponent
                name={frame1Name}
                tracker={component1Tracker}
              />
              <MultiIFrameComponent
                name={frame1Name}
                tracker={component2Tracker}
              />
              <MultiIFrameComponent
                name={frame1Name}
                tracker={component3Tracker}
              />
            </div>
          );

          sendWindowMessage({
            data: doNotResolveData,
            ...getMessageOriginAndSource(
              getIFrameFromResult(result, frame1Name)
            ),
          });

          await waitFor(() => {
            expect(
              verifyTrackerReceivedAnEvent(component1Tracker, doNotResolveData)
            ).toBeTruthy();
            expect(
              verifyTrackerReceivedAnEvent(component2Tracker, doNotResolveData)
            ).toBeTruthy();
            expect(
              verifyTrackerReceivedAnEvent(component3Tracker, doNotResolveData)
            ).toBeTruthy();
          });

          cleanUpIFrame(frame1Name);

          await waitFor(() => {
            expect(
              didTrackerReceiveCleanUpMessage(component1Tracker, frame1Name)
            ).toBeTruthy();
            expect(
              didTrackerReceiveIFrameRemovedMessage(
                component2Tracker,
                frame1Name
              )
            ).toBeTruthy();
            expect(
              didTrackerReceiveIFrameRemovedMessage(
                component3Tracker,
                frame1Name
              )
            ).toBeTruthy();
          });
        });
        jest.useFakeTimers();
      });
      it('When message validator returns true, all loaders are fullfilled and cleaned up', async () => {
        await act(async () => {
          const result = render(
            <div>
              <MultiIFrameComponent name="frame1" tracker={component1Tracker} />
              <MultiIFrameComponent name="frame1" tracker={component2Tracker} />
              <MultiIFrameComponent name="frame1" tracker={component3Tracker} />
            </div>
          );
          sendWindowMessage({
            data: resolveData,
            ...getMessageOriginAndSource(
              getIFrameFromResult(result, frame1Name)
            ),
          });

          await waitFor(() => {
            expect(
              verifyTrackerReceivedAnEvent(component1Tracker, resolveData)
            ).toBeTruthy();

            expect(
              verifyTrackerReceivedAnEvent(component2Tracker, resolveData)
            ).toBeTruthy();

            expect(
              verifyTrackerReceivedAnEvent(component3Tracker, resolveData)
            ).toBeTruthy();
          });

          // all components use successListener and errorListener
          expect(successListener).toHaveBeenCalledTimes(3);
          expect(errorListener).toHaveBeenCalledTimes(0);
        });
      });
      it('All are rejected and cleaned up when timeout expires.', async () => {
        await act(async () => {
          render(
            <div>
              <MultiIFrameComponent name="frame1" tracker={component1Tracker} />
              <MultiIFrameComponent name="frame1" tracker={component2Tracker} />
              <MultiIFrameComponent name="frame1" tracker={component3Tracker} />
            </div>
          );
          jest.advanceTimersByTime(iFrameTimeout * 2);
          jest.useRealTimers();
          await waitFor(() => {
            expect(successListener).toHaveBeenCalledTimes(0);
            expect(errorListener).toHaveBeenCalledTimes(3);

            expect(
              didTrackerReceiveCleanUpMessage(component1Tracker, frame1Name)
            ).toBeFalsy();

            expect(
              didTrackerReceiveIFrameRemovedMessage(
                component2Tracker,
                frame1Name
              )
            ).toBeTruthy();

            expect(
              didTrackerReceiveIFrameRemovedMessage(
                component3Tracker,
                frame1Name
              )
            ).toBeTruthy();
          });
          jest.useFakeTimers();
        });
      });
    });
    describe('Loaders with different names are not connected and', () => {
      it('When messages are sent, only events from given iframe are listened to.', async () => {
        // again useRealTimers is required when using cleanUpIFrame()
        await act(async () => {
          jest.useRealTimers();
          const result = render(
            <div>
              <MultiIFrameComponent
                name={frame1Name}
                tracker={component1Tracker}
              />
              <MultiIFrameComponent
                name={frame2Name}
                tracker={component2Tracker}
              />
              <MultiIFrameComponent
                name={frame3Name}
                tracker={component3Tracker}
              />
            </div>
          );

          sendWindowMessage({
            data: doNotResolveData,
            ...getMessageOriginAndSource(
              getIFrameFromResult(result, frame1Name)
            ),
          });

          await waitFor(() => {
            expect(component1Tracker).toHaveBeenCalledTimes(1);
            expect(component2Tracker).toHaveBeenCalledTimes(0);
            expect(component3Tracker).toHaveBeenCalledTimes(0);
          });

          sendWindowMessage({
            data: doNotResolveData,
            ...getMessageOriginAndSource(
              getIFrameFromResult(result, frame2Name)
            ),
          });
          sendWindowMessage({
            data: doNotResolveData,
            ...getMessageOriginAndSource(
              getIFrameFromResult(result, frame3Name)
            ),
          });

          await waitFor(() => {
            expect(component1Tracker).toHaveBeenCalledTimes(1);
            expect(component2Tracker).toHaveBeenCalledTimes(1);
            expect(component3Tracker).toHaveBeenCalledTimes(1);
          });

          cleanUpIFrame(frame1Name);

          await waitFor(() => {
            expect(component1Tracker).toHaveBeenCalledTimes(2);
            expect(component2Tracker).toHaveBeenCalledTimes(1);
            expect(component3Tracker).toHaveBeenCalledTimes(1);
            expect(
              didTrackerReceiveCleanUpMessage(component1Tracker, frame1Name)
            ).toBeTruthy();
          });

          sendWindowMessage({
            data: resolveData,
            ...getMessageOriginAndSource(
              getIFrameFromResult(result, frame2Name)
            ),
          });

          await waitFor(() => {
            expect(component1Tracker).toHaveBeenCalledTimes(2);
            // component2Tracker calls are increased by 2
            // because component2Tracker tracks message validation and resolved promises
            // and the sendWindowMessage() resolves it.
            expect(component2Tracker).toHaveBeenCalledTimes(3);
            expect(component3Tracker).toHaveBeenCalledTimes(1);
            expect(
              didTrackerReceiveCleanUpMessage(component2Tracker, frame2Name)
            ).toBeFalsy();
          });

          sendWindowMessage({
            data: doNotResolveData,
            ...getMessageOriginAndSource(
              getIFrameFromResult(result, frame3Name)
            ),
          });
          cleanUpIFrame(frame3Name);

          await waitFor(() => {
            expect(component1Tracker).toHaveBeenCalledTimes(2);
            expect(component2Tracker).toHaveBeenCalledTimes(3);
            expect(component3Tracker).toHaveBeenCalledTimes(3);
            expect(
              didTrackerReceiveCleanUpMessage(component3Tracker, frame3Name)
            ).toBeTruthy();
          });
          jest.useFakeTimers();
        });
      });
    });
  });
});
