import React from 'react';
import {
  act,
  render,
  waitFor,
  cleanup,
  screen,
  fireEvent,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router, Route, Switch, useLocation, Link } from 'react-router-dom';

import { getActiveElement } from '../../../common/test/testingLibraryTools';
import {
  pageLoadFocusTargetClassName,
  usePageLoadFocusSetter,
} from '../usePageLoadFocusSetter';
import { useHistoryListener } from '../useHistoryListener';
import FocusableH1 from '../../../common/focusableH1/FocusableH1';

const focusableH1 = 'focusableH1';
const plainH1 = 'plainH1';
const className = 'className';
const noFocusableElement = 'noFocusableElement';
const disabledFocus = 'disabledFocus';
const selectorDefined = 'selectorDefined';

const scenarios = [
  focusableH1,
  plainH1,
  className,
  noFocusableElement,
  disabledFocus,
  selectorDefined,
] as const;

type TestScenario = typeof scenarios[number];

let mockHistory: ReturnType<typeof createMemoryHistory>;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn().mockImplementation(() => mockHistory),
  useLocation: jest.fn().mockImplementation(() => mockHistory.location),
}));

describe('usePageLoadFocusSetter.ts ', () => {
  const pathIndicatorTestId = 'current-path';
  const stripBackLashes = (str: string) => str.replace(/\//g, '');
  const getLinkText = (path: string) => `Link to ${path}`;
  const getLinkTestId = (path: string) => `link-to-${stripBackLashes(path)}`;
  const getElementTestId = (path: string) =>
    `element-for-${stripBackLashes(path)}`;

  const focusTracker = jest.fn();
  const onElemenFocus = (source: TestScenario) => {
    focusTracker(source);
  };

  const TestWrapper = ({
    scenario,
    children,
  }: {
    scenario: TestScenario;
    children: React.ReactElement | null;
  }) => {
    const selector =
      scenario === 'selectorDefined' ? '#selectorDefined' : undefined;
    const disableFocusing = scenario === 'disabledFocus';
    usePageLoadFocusSetter({ selector, disableFocusing });
    return (
      <div>
        <Nav />
        <button
          type="button"
          tabIndex={0}
          onFocus={() => focusTracker('invalid')}
        >
          Focusable button trying to steal focus
        </button>
        {children}
      </div>
    );
  };

  const Nav = () => {
    const location = useLocation();
    return (
      <div>
        {scenarios.map(path => (
          <Link to={path} data-testid={getLinkTestId(path)} key={path}>
            {getLinkText(path)}
          </Link>
        ))}
        <span data-testid={pathIndicatorTestId}>{location.pathname}</span>
      </div>
    );
  };

  const Root = () => (
    <main>
      <Nav />
      <p>This is root page</p>
    </main>
  );

  const getTestElement = (
    scenario: TestScenario
  ): React.ReactElement | null => {
    const onFocus = () => onElemenFocus(scenario);
    const commonProps = {
      onFocus,
      'data-testid': getElementTestId(scenario),
    };
    if (scenario === focusableH1 || scenario === disabledFocus) {
      return <FocusableH1 {...commonProps}>I'm focusable h1</FocusableH1>;
    }
    if (scenario === plainH1) {
      return <h1 {...commonProps}>Just a plain h1</h1>;
    }
    if (scenario === className) {
      return (
        <button {...commonProps} className={pageLoadFocusTargetClassName}>
          Button
        </button>
      );
    }
    if (scenario === noFocusableElement) {
      return (
        <textarea
          tabIndex={0}
          {...commonProps}
          defaultValue="Should not focus me!"
        ></textarea>
      );
    }
    if (scenario === selectorDefined) {
      return (
        <div {...commonProps} id="selectorDefined">
          Should focus me by id!
        </div>
      );
    }

    return null;
  };

  const getWrappedTestElement = (
    scenario: TestScenario
  ): React.ReactElement => (
    <TestWrapper scenario={scenario}>{getTestElement(scenario)}</TestWrapper>
  );

  const TestApp = () => {
    useHistoryListener();
    return (
      <div>
        <Switch>
          <Route exact path="/">
            <Root />
          </Route>
          {scenarios.map(path => (
            <Route path={`/${path}`} key={path}>
              {getWrappedTestElement(path)}
            </Route>
          ))}
        </Switch>
      </div>
    );
  };

  const navigateTo = async (targetPath: string): Promise<void> => {
    fireEvent.click(screen.getByTestId(getLinkTestId(targetPath)));
    await waitFor(() => {
      const path = stripBackLashes(
        screen.getByTestId(pathIndicatorTestId).innerHTML
      );
      if (path !== targetPath) {
        throw new Error(`Path ${path} is not ${targetPath}`);
      }
    });
  };

  const waitForFocus = async (testId: string): Promise<void> => {
    await waitFor(async () => {
      const element = screen.getByTestId(getElementTestId(testId));
      const activeElement = getActiveElement(element);
      expect(element).not.toBeNull();
      expect(activeElement).not.toBeNull();
      expect(element).toBe(activeElement);
    });
  };

  const navigateAndCheckFocus = async (
    scenario: TestScenario | '',
    initialEntries: string[] = [''],
    shouldFocus = true
  ): Promise<void> => {
    mockHistory = createMemoryHistory({ initialEntries });
    render(
      <Router history={mockHistory}>
        <TestApp />
      </Router>
    );

    if (scenario) {
      await navigateTo(scenario);
    }

    if (shouldFocus) {
      await waitForFocus(scenario);
      expect(focusTracker).toHaveBeenCalledTimes(1);
      expect(focusTracker).toHaveBeenLastCalledWith(scenario);
    } else {
      expect(focusTracker).toHaveBeenCalledTimes(0);
    }
  };

  afterEach(() => {
    cleanup();
    focusTracker.mockReset();
  });

  describe('Focuses to an element, if history has an internal page load', () => {
    it('Targeted element is by default an element with a certain className', async () => {
      await act(async () => {
        await navigateAndCheckFocus(focusableH1);
      });
    });

    it(`Targeted element is h1, if element with a certain className is not found. 
        Tabindex="-1" is added to a non-focusable element.
        In this test it is a h1 element.`, async () => {
      await act(async () => {
        await navigateAndCheckFocus(plainH1);
        const element = screen.getByTestId(getElementTestId(plainH1));
        expect(element.getAttribute('tabindex')).toBe('-1');
      });
    });

    it(`Targeted element can be any element with a certain className.
        Tabindex is not set if element can be focused without it.
        In this test it is a button element.
        `, async () => {
      await act(async () => {
        await navigateAndCheckFocus(className);
        const element = screen.getByTestId(getElementTestId(className));
        expect(element.getAttribute('tabindex')).toBeNull();
      });
    });
    it(`Targeted element can defined with a selector.
        Tabindex="-1" is added to a non-focusable element
        In this test it is a div element.`, async () => {
      await act(async () => {
        await navigateAndCheckFocus(selectorDefined);
        const element = screen.getByTestId(getElementTestId(selectorDefined));
        expect(element.getAttribute('tabindex')).toBe('-1');
      });
    });
  });
  describe('Does not set focus ', () => {
    it(`if history has no internal page load. 
        History is initialized with a route.
        Route is not changed.`, async () => {
      await act(async () => {
        await navigateAndCheckFocus('', [`/${focusableH1}`], false);
        const element = screen.getByTestId(getElementTestId(focusableH1));
        // check the focusable element was rendered
        expect(element).not.toBeNull();
      });
    });
    it('when there is no element to target', async () => {
      await act(async () => {
        await navigateAndCheckFocus(noFocusableElement, undefined, false);
      });
    });
    it('when hook is disabled', async () => {
      await act(async () => {
        await navigateAndCheckFocus(disabledFocus, undefined, false);
        const element = screen.getByTestId(getElementTestId(disabledFocus));
        // check the focusable element was rendered
        expect(element).not.toBeNull();
      });
    });
  });
});
