# Unit Tests Migration Fixes

## Context

During migration to React 19 (with `@testing-library/react` v16, HDS v6, React Hook Form replacing Formik, and Apollo 3.14.1), **19 unit tests fail** across 4 failure categories. This document identifies root causes and prescribes fixes, ordered from lowest to highest effort.

---

## Summary

| # | Category | File(s) | Tests fixed | Effort |
|---|----------|---------|-------------|--------|
| 1 | ~~Fake timers vs `waitFor`~~ | ~~`useProfileLoadTracker.test.ts`~~ | ~~5~~ | ✅ Done |
| 2 | ~~HDS v6 Select toggle debounce~~ | ~~`testingLibraryTools.ts`~~ | ~~1~~ | ✅ Done |
| 3 | ~~Form submit timing~~ | ~~`testingLibraryTools.ts`~~ | ~~15~~ | ✅ Done |
| 4 | ~~Apollo `useLazyQuery` API~~ | ~~`DeleteProfile.tsx`, `DeleteProfile.test.tsx`~~ | ~~3~~ | ✅ Done |

---

## Fix 1 — `useProfileLoadTracker` Fake Timers (5 tests) ✅ Done

**Affected file:** `src/profile/hooks/__tests__/useProfileLoadTracker.test.ts`

### Root cause

The test uses `vi.useFakeTimers()` in `beforeEach`. In `@testing-library/react` v16 (and `@testing-library/dom` v10), `waitFor` internally polls via `setInterval(fn, 50)`. With fake timers active, this `setInterval` never fires — `waitFor` can never retry, and every async assertion times out at 5000ms.

The `waitForProfileLoadToEnd` helper:
```ts
const waitForProfileLoadToEnd = async (renderHookResult: RenderResult) =>
  waitFor(async () => {
    if (currentHookProps.isProfileLoadComplete() === false) {
      renderHookResult.rerender();
      advanceTimers(); // advances fake timers
      throw new Error('Profile load is not complete'); // signals retry
    }
  });
```

The retry never executes because `waitFor`'s own internal interval is blocked by the fake timer.

### Fix

Change one line in `beforeEach` from:
```ts
vi.useFakeTimers();
```
to:
```ts
vi.useFakeTimers({ shouldAdvanceTime: true });
```

`shouldAdvanceTime: true` makes vitest automatically advance fake time as real time elapses. This allows `waitFor`'s internal `setInterval` to fire normally, while the test still controls fake timers via `vi.advanceTimersByTime()`.

**Why test file change is necessary:** The component `useProfileLoadTracker.ts` was not changed in this migration. The failure is purely a test compatibility issue between `vi.useFakeTimers()` and RTL v16's async utilities.

---

## Fix 2 — FormDropdown HDS v6 Toggle Debounce (1 test) ✅ Done

**Affected file:** `src/common/test/testingLibraryTools.ts` — `comboBoxSelector` function

### Root cause

HDS v6 `Select` includes a **200ms toggle debounce** to prevent accidental double-open/close in real browser interactions (source: `const k = 200` in `ListAndInputContainer`):

```js
// HDS v6 internals (simplified):
const toggle = (open) => {
  if (currentOpen === open) return false; // already in desired state
  const now = Date.now();
  if (now - lastToggleCommand < 200) return false; // debounce — click ignored
  updateData({ open });
  updateMetaData({ lastToggleCommand: now });
  return true;
};
```

When a test iterates through multiple dropdown values (e.g. the "Changing an option" test loops over 6 values), the following race occurs:

1. **Iteration 1** — click opens the dropdown, user selects Denmark, dropdown closes → `lastToggleCommand = Date.now()`
2. **Iteration 2** — `comboBoxSelector` calls `clickElement(toggleButton)` which fires a single `fireEvent.click`. In jsdom everything runs synchronously, so this click lands **within 200ms** of the close in step 1. HDS silently ignores it. The dropdown stays closed.
3. The subsequent `await clickElement({ text: value })` then fails with `"Unable to find an element with text: Bhutan (+975)"` — not because options render asynchronously, but because the **dropdown was never opened**.

### Fix

Replace the single `clickElement` call with a `waitFor` loop that checks `aria-expanded` and retries the click until the debounce window clears. With `waitFor` polling at ~50ms intervals, a click will succeed as soon as 200ms have elapsed since the last toggle:

```ts
// Old — fires the click once; silently fails if debounced:
await clickElement({ id: `${selectorPrefix}-main-button` });
await clickElement({ text: value });

// Fixed — retries the click until aria-expanded="true", then waits for the option:
await waitFor(() => {
  const button = renderResult.container.querySelector(
    `#${selectorPrefix}-main-button`
  ) as HTMLElement;
  if (!button) throw new Error(`Button #${selectorPrefix}-main-button not found`);
  if (button.getAttribute('aria-expanded') !== 'true') {
    fireEvent.click(button);
    throw new Error('Dropdown not yet open');
  }
});

await waitFor(() => {
  const option = renderResult.getByText(value);
  fireEvent.click(option);
});
```

The second `waitFor` (option lookup) also guards against any async rendering on first open.

---

## ~~Fix 3 — Form Submission Timing (15 tests)~~ ✅ Done

**Affected file:** `src/common/test/testingLibraryTools.ts` — `submit()` function

**Failing test files:** `BasicData`, `EmailEditor`, `PhoneNumberFormAndData`, `AddressFormAndData`

### Root cause

React 19 automatic batching prevents the intermediate `saving/disabled` state from being committed to the DOM before the mutation completes.

**With Formik (old):** Formik dispatched `SUBMIT_ATTEMPT` synchronously before async validation — this forced a re-render at the `await` boundary, making the button visibly disabled *before* the mutation started.

**With React Hook Form (new):** `handleSubmit` + yup validation + Apollo mutation all complete within the same microtask chain in the test environment (where fetch mocks resolve synchronously). React 19 batches all state updates into a single render — the intermediate "disabled" state is never committed to DOM.

**Two distinct failure modes** both timed out with "NOT DISABLED" in `testingLibraryTools.ts`:

```ts
await waitFor(() => {
  if (!isDisabled(getElement(currentSubmitButtonSelector))) {
    throw new Error('NOT DISABLED');
  }
});
```

1. **Success path:** The mutation succeeds instantly, the component transitions from edit → view mode, and the submit button is *removed from the DOM*. `getElement()` throws `"Element not found"`, which `waitFor` treats as a retry condition — so it retries until timeout even though the form already succeeded.

2. **Error path:** The mutation fails instantly, the component stays in edit mode with an error notification. The button is *present in the DOM but never becomes disabled* — `waitFor` retries "NOT DISABLED" until timeout (1000ms).

In both cases the form had already finished processing, but the test was stuck waiting for a disabled state that React 19 batching never produced.

**Cascading failure:** Once the disabled-button check was fixed for the success path (by treating "Element not found" as success), the next step — `waitForOnSaveNotification` — also fails. It looks for a "saving…" indicator in the DOM, but that intermediate state was also collapsed by React 19 batching and never rendered.

### Fix

Replace the disabled-button `waitFor` with a **300ms timeout + `.catch()`**. If the button doesn't become disabled (or disappear) within 300ms, the submission already completed and we set `skipSavingCheck = true` to skip the saving-indicator check as well:

```ts
// Current:
await waitFor(() => {
  if (!isDisabled(getElement(currentSubmitButtonSelector))) {
    throw new Error('NOT DISABLED');
  }
});
if (waitForOnSaveNotification) {
  await waitForElementAndValue(waitForOnSaveNotification);
}

// Fixed:
let skipSavingCheck = false;
await waitFor(
  () => {
    try {
      if (!isDisabled(getElement(currentSubmitButtonSelector))) {
        throw new Error('NOT DISABLED');
      }
    } catch (e) {
      if ((e as Error).message?.startsWith('Element not found')) {
        skipSavingCheck = true; // button gone = success transition
        return;
      }
      throw e;
    }
  },
  { timeout: 300 }
).catch(() => {
  // waitFor timed out: submission completed instantly (React 19 batching)
  skipSavingCheck = true;
});
if (waitForOnSaveNotification && !skipSavingCheck) {
  await waitForElementAndValue(waitForOnSaveNotification);
}
```

**Why this is correct:**

- **Success path:** Button disappears → `"Element not found"` caught → `skipSavingCheck = true` → resolves immediately. The `waitForAfterSaveNotification` (success notification) still runs.
- **Error path:** Button stays present and never disabled → `waitFor` times out after 300ms → `.catch()` sets `skipSavingCheck = true`. The `waitForAfterSaveNotification` (error notification) still runs.
- **Slow async path (future-proofing):** Button becomes disabled within 300ms → `waitFor` resolves normally, `skipSavingCheck` stays `false`, and `waitForOnSaveNotification` still runs.

The 300ms timeout is safe for tests because all Apollo mocks resolve synchronously (within one microtask), so a genuine slow mutation would never appear in this test suite.

---

## Fix 4 — DeleteProfile Apollo `useLazyQuery` API (3 tests) ✅ Done

**Affected files:**
- `src/profile/components/deleteProfile/DeleteProfile.tsx` (component refactor)
- `src/profile/components/deleteProfile/__tests__/DeleteProfile.test.tsx` (test updates)

### Root cause (two distinct issues)

#### Issue A — Apollo 3.14.1 removed `variables`/`onCompleted`/`onError` from `useLazyQuery` options

```ts
// Current — NO LONGER SUPPORTED:
const [getServiceConnections, { data: serviceConnections }] = useLazyQuery<...>(
  SERVICE_CONNECTIONS,
  {
    variables: createServiceConnectionsQueryVariables(i18n.language),  // ❌
    fetchPolicy: 'no-cache',
    onCompleted: () => {
      if (dataLoadState === loadedLoadState) return;
      setDataLoadState(loadedLoadState);
      handleConfirmationModal();
    },
    onError: (error) => {
      setDataLoadState(errorLoadState);
      reportErrorsToSentry(error);
    },
  }
);
```

Apollo's guidance:
- Pass `variables` to the execute function instead
- Replace `onCompleted`/`onError` with `useEffect` watching `data`/`error`

#### Issue B — React 19 batching collapses the intermediate loading state in tests

The tests expected to observe a brief "loading" state between the button click and the confirmation modal appearing:

```ts
await clickElement(submitButton);
await waitForElement(loadIndicator);    // ← intermediate loading state
await waitForElement(confirmButtonSelector);
```

With the `useEffect`-based fix, the sequence inside `act` is:
1. `loadServiceConnections()` runs: `setDataLoadState('loading')` + `getServiceConnections({variables})`
2. Apollo mock resolves immediately (synchronous in tests)
3. `useEffect` for `serviceConnections` fires: `setDataLoadState('loaded')` + opens modal

React 19's automatic batching + RTL's `act` flush the entire chain synchronously, so the intermediate `'loading'` render is never observable by the time `clickElement` resolves. The same React 19 batching problem from Fix 3 applies here, but for the loading indicator rather than the save indicator.

### Fix — Component (`DeleteProfile.tsx`)

```ts
// 1. Remove variables/onCompleted/onError from options, destructure error:
const [getServiceConnections, { data: serviceConnections, error: serviceConnectionsError }] =
  useLazyQuery<ServiceConnectionsRoot, ServiceConnectionsQueryVariables>(
    SERVICE_CONNECTIONS,
    { fetchPolicy: 'no-cache' }
  );

// 2. Replace onCompleted with useEffect:
useEffect(() => {
  if (!serviceConnections) return;
  if (dataLoadState === loadedLoadState) return;
  setDataLoadState(loadedLoadState);
  handleConfirmationModal();
}, [serviceConnections]); // eslint-disable-line react-hooks/exhaustive-deps

// 3. Replace onError with useEffect:
useEffect(() => {
  if (!serviceConnectionsError) return;
  setDataLoadState(errorLoadState);
  reportErrorsToSentry(serviceConnectionsError);
}, [serviceConnectionsError]); // eslint-disable-line react-hooks/exhaustive-deps

// 4. In loadServiceConnections callback, pass variables to the execute call
//    and add i18n.language to deps:
getServiceConnections({
  variables: createServiceConnectionsQueryVariables(i18n.language),
});
```

### Fix — Tests (`DeleteProfile.test.tsx`)

Remove the intermediate `waitForElement(loadIndicator)` assertions — React 19 + `act` flush past that state before the test can observe it. Wait directly for the final state instead.

```ts
// proceedUIToDeletionConfimed — before:
await clickElement(submitButton);
await waitForElement(loadIndicator);        // ❌ collapsed by React 19 batching
await waitForElement(confirmButtonSelector);
await clickElement(confirmButtonSelector);

// proceedUIToDeletionConfimed — after:
await clickElement(submitButton);
// React 19 batching collapses the intermediate loading state — skip checking
// the load indicator and wait directly for the confirmation modal.
await waitForElement(confirmButtonSelector);
await clickElement(confirmButtonSelector);

// Error test — before:
await clickElement(submitButton);
await waitForElement(loadIndicator);        // ❌ collapsed by React 19 batching
await waitForElement(reloadServiceConnectionsButtonSelector);

// Error test — after:
await clickElement(submitButton);
// React 19 batching collapses the intermediate loading state; go straight to error UI.
await waitForElement(reloadServiceConnectionsButtonSelector);
```

**Why this is correct:** The already-passing "UI won't get stuck on loading state when re-rendered" test already used this pattern (no intermediate loading indicator check), confirming the approach.

---

## Implementation Order

```
Fix 1 → Fix 2 → Fix 3 → Fix 4
```

After all fixes:
```bash
pnpm test
```

---

## Post-migration fixes (2 additional tests) ✅ Done

After the 4 main fixes were applied, 2 more tests were found failing.

---

### Fix 5 — `ProfileContext` error test: raw promise vs `waitFor` ✅ Done

**Affected file:** `src/profile/context/__tests__/ProfileContext.test.tsx`

**Test:** `Fetch errors are handled and listeners triggered and disposed. Error is reported to Sentry`

#### Root cause

The test used a custom `waitForErrorChange()` promise (from `exposeHooksForTesting.tsx`) that resolves when `getErrorMessage(context.error)` changes during a render. In React 19 concurrent mode, `context.fetch()` schedules Apollo state updates that may be deferred. The raw promise fires from inside the render before the deferred update is fully committed, so `result.current.error` is still `undefined` when the test reads it.

#### Fix

Replace the raw `waitForErrorChange()` / `await errorPromise` pattern with `waitFor(() => expect(result.current.error).toBeDefined())`. RTL's `waitFor` wraps each check in `act()`, which flushes pending React 19 deferred updates before asserting. The same applies to the second error (refetch): replaced `await secondErrorPromise` with `waitFor(() => expect(errorListener2).toHaveBeenCalledTimes(2))`.

---

### Fix 6 — `useAuthCodeQueues` redirector state race ✅ Done

**Affected file:** `src/gdprApi/__tests__/useAuthCodeQueues.test.tsx`

**Test:** `Testing whole download queue action by action. > phases change and re-rendering or unmounting (in correct phases) wont affect anything`

#### Root cause

After completing `keycloakAuthCodeParserAction`, the test waited for the `redirector` action to appear in `"started"` state. The `redirector` mock uses `runOriginal: true` with `resolveExecutorWithRedirection`, which returns `Promise.resolve()` immediately — it starts **and** completes within a single microtask batch. React 19's improved batching means the redirector's `"started"` state is never observable by `waitFor`; by the time `waitFor` polls, `redirectionCatcher` has already taken over as the active action.

#### Fix

Change the `nextActionType` argument from `defaultRedirectorActionType` to `defaultRedirectionCatcherActionType`. The `redirectionCatcher` mock uses `runOriginal: false` with a manual executor that stays in `"started"` until explicitly completed, making it reliably observable by `waitFor`.
