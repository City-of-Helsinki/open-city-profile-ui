import React from 'react';
import {
  act,
  render,
  waitFor,
  cleanup,
  screen,
  fireEvent,
} from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
  Route,
  Routes,
  Link,
} from 'react-router-dom';

import { getActiveElement } from '../../../common/test/testingLibraryTools';
import {
  pageLoadFocusTargetClassName,
  usePageLoadFocusSetter,
} from '../usePageLoadFocusSetter';
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

describe('usePageLoadFocusSetter.ts', () => {
  const stripBackLashes = (str: string) => str.replace(/\//g, '');
  const getLinkTestId = (path: string) => `link-to-${stripBackLashes(path)}`;
  const getElementTestId = (path: string) =>
    `element-for-${stripBackLashes(path)}`;

  const focusTracker = vi.fn();
  const onElemenFocus = (source: TestScenario) => {
    focusTracker(source);
  };

  const Nav = () => (
    <div>
      {scenarios.map(path => (
        <Link to={`/${path}`} data-testid={getLinkTestId(path)} key={path}>
          Link to {path}
        </Link>
      ))}
    </div>
  );

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
      return <FocusableH1 {...commonProps}>I am focusable h1</FocusableH1>;
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
        />
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

  const TestApp = () => (
    <div>
      <Routes>
        <Route path="/" element={<Root />} />
        {scenarios.map(path => (
          <Route
            key={path}
            path={`/${path}`}
            element={getWrappedTestElement(path)}
          />
        ))}
      </Routes>
    </div>
  );

  const navigateTo = async (
    router: ReturnType<typeof createMemoryRouter>,
    targetPath: string
  ): Promise<void> => {
    await act(async () => {
      fireEvent.click(screen.getByTestId(getLinkTestId(targetPath)));
    });

    await waitFor(() => {
      const currentPath = router.state.location.pathname;

      if (currentPath !== `/${targetPath}`) {
        throw new Error(`Path ${currentPath} is not /${targetPath}`);
      }
    });
  };

  const waitForFocus = async (testId: string): Promise<void> => {
    await waitFor(() => {
      const element = screen.getByTestId(getElementTestId(testId));
      const activeElement = getActiveElement(element);
      expect(activeElement).toBe(element);
    });
  };

  const navigateAndCheckFocus = async (
    scenario: TestScenario | '',
    initialEntries: string[] = [''],
    shouldFocus = true
  ): Promise<void> => {
    const routes = [
      {
        path: '*',
        element: <TestApp />,
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries,
    });

    render(<RouterProvider router={router} />);

    if (scenario) {
      await navigateTo(router, scenario);
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

  describe('Focuses to an element if history has internal page load', () => {
    it('Focuses an element with a certain className by default', async () => {
      await navigateAndCheckFocus(focusableH1);
    });

    it('Focuses a plain h1 with tabindex added if no class element found', async () => {
      await navigateAndCheckFocus(plainH1);
      const element = screen.getByTestId(getElementTestId(plainH1));
      expect(element.getAttribute('tabindex')).toBe('-1');
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
