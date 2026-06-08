# React 19 Migration Plan

## Summary

This plan covers non-HDS packages that are incompatible with React 19 in this workspace.

| Package | Current Version | Issue | Action |
|---------|----------------|-------|--------|
| `@testing-library/react` | `^13.0.0` (resolves 13.x) | Peer dep requires `react: ^18.0.0` | Upgrade to `^16.x` |
| `formik` | `^2.0.4` (resolves 2.4.9) | Uses `ReactDOM.findDOMNode` and legacy context API removed in React 19 | Replace with alternative |

### Already Compatible (no action needed)

| Package | Status |
|---------|--------|
| `react-helmet` | ✅ Already replaced with `react-helmet-async` |
| `@apollo/client` | ✅ Resolved to v3.14.1 — supports React 19 since ~3.12 |
| `ahooks` | ✅ v3.9.7 declares `react: ^19.0.0` |
| `react-i18next` | ✅ v15 declares `react: >= 16.8.0` |
| `@sentry/react` | ✅ v9 declares `react: 19.x` |
| `react-router` / `react-router-dom` | ✅ v7 is React 19 compatible |

---

## 1. `@testing-library/react` — Upgrade to v16

### Scope

- **46 test files** import from `@testing-library/react`
- APIs used: `render`, `screen`, `waitFor`, `fireEvent`, `act`, `cleanup`, `renderHook`, `RenderResult`
- No shared custom render wrapper exists
- Test runner: Vitest with jsdom, setup in `src/setupTests.ts`

### Migration Steps

1. Update `package.json`: change `"@testing-library/react": "^13.0.0"` → `"@testing-library/react": "^16.0.0"`
2. Run `pnpm install`
3. Run `pnpm test` to verify

### Breaking Changes (v13 → v16)

- **`renderHook`** — Moved from `@testing-library/react-hooks` to `@testing-library/react` in v13, no change needed.
- **`act` re-export** — In v16, `act` is re-exported from React directly. Should be transparent.
- **`cleanup`** — Automatic cleanup still works with Vitest's `afterEach`. No changes expected.
- **`waitFor` / async utilities** — Behavior is the same; React 19's concurrent rendering may surface timing issues in some tests. Fix by awaiting properly.
- **Type changes** — `RenderResult` still exists. `@types/testing-library__react` is no longer needed (types are bundled).

### Risk: Low

This is a straightforward version bump. Most tests should pass without changes. A few tests may need minor async timing adjustments due to React 19's batching behavior.

---

## 2. `formik` — Replace with React Hook Form

### Why Not Upgrade Formik?

- Formik v3 has been in alpha/beta since 2020 and is not production-ready
- Formik v2 uses `ReactDOM.findDOMNode` (removed in React 19) and legacy context
- The library is effectively unmaintained

### Scope

**5 form components** use Formik:

| File | Complexity | Formik APIs |
|------|-----------|-------------|
| `src/profile/components/basicData/BasicData.tsx` | Medium | `Formik`, `Form`, `Field`, `FormikProps` + `basicDataSchema` (Yup) |
| `src/profile/components/addressEditor/AddressFormAndData.tsx` | High | `Formik`, `Form`, `Field`, `FormikProps` + `addressSchema` (Yup) |
| `src/profile/components/emailEditor/EmailEditor.tsx` | Low | `Formik`, `Form`, `Field`, `FormikProps` + `emailSchema` (Yup) |
| `src/profile/components/phoneNumberEditor/PhoneNumberFormAndData.tsx` | High | `Formik`, `Form`, `Field`, `FormikProps` + `phoneSchema` (Yup) |
| `src/profile/components/additionalInformation/AdditionalInformation.tsx` | Low | `Formik`, `Form`, `FormikProps`, `setFieldValue` |

**3 helper/utility files:**

| File | Purpose |
|------|---------|
| `src/common/formikDropdown/FormikDropdown.tsx` | Wraps HDS `Select` in a Formik `Field` |
| `src/profile/helpers/formik.ts` | Error extraction/display utilities using `FormikProps` |
| `src/profile/components/accessibleFormikErrors/AccessibleFormikErrors.tsx` | Screen-reader error announcements |

**1 test file:**

| File | Purpose |
|------|---------|
| `src/common/formikDropdown/__tests__/FormikDropdown.test.tsx` | Unit test for FormikDropdown |

**Yup schemas** (reusable with React Hook Form via `@hookform/resolvers`):

- `src/common/schemas/schemas.ts` — `addressSchema`, `basicDataSchema`, `phoneSchema`, `emailSchema`

### Migration Steps

1. Add `react-hook-form` and `@hookform/resolvers` to `package.json`
2. Migrate forms one by one (recommended order below)
3. Replace helper utilities
4. Remove `formik` from `package.json`

### Recommended Migration Order

1. **`EmailEditor`** (simplest — 1 field, good pilot for the pattern)
2. **`AdditionalInformation`** (simple — 1 dropdown, no Yup schema)
3. **`BasicData`** (medium — 3 fields with Yup)
4. **`PhoneNumberFormAndData`** (complex — custom inputs, `setFieldValue`)
5. **`AddressFormAndData`** (complex — dropdown + text inputs, Yup)

### Pattern Mapping: Formik → React Hook Form

| Formik Pattern | React Hook Form Equivalent |
|---------------|---------------------------|
| `<Formik initialValues={...} onSubmit={...}>` | `const { handleSubmit, control } = useForm({ defaultValues, resolver: yupResolver(schema) })` |
| `<Form>` | `<form onSubmit={handleSubmit(onSubmit)}>` |
| `<Field name="x" />` | `<Controller name="x" control={control} render={...} />` or `register("x")` |
| `FormikProps<T>` | `UseFormReturn<T>` |
| `setFieldValue("name", val)` | `setValue("name", val)` |
| `errors.fieldName` | `formState.errors.fieldName` |
| `touched.fieldName` | `formState.touchedFields.fieldName` |
| `isSubmitting` | `formState.isSubmitting` |
| `dirty` | `formState.isDirty` |

### Helper Replacements

- **`FormikDropdown.tsx`** → Create a `ControlledDropdown` using React Hook Form's `Controller`
- **`formik.ts` (error helpers)** → Rewrite to read from `formState.errors` (simpler API)
- **`AccessibleFormikErrors.tsx`** → Rewrite to accept `formState.errors` instead of `FormikProps`

### Yup Schemas

All existing Yup schemas in `src/common/schemas/schemas.ts` can be reused as-is via `@hookform/resolvers/yup`:

```tsx
import { yupResolver } from '@hookform/resolvers/yup';
import { basicDataSchema } from '../../common/schemas/schemas';

const { control, handleSubmit } = useForm({
  resolver: yupResolver(basicDataSchema),
});
```

### Risk: Medium

- 5 form components + helpers need rewriting
- Tests for these components will need updates
- Functional behavior must be preserved (validation timing, error display, accessibility)
- The `FocusKeeper` and `AccessibleFormikErrors` patterns need careful migration to maintain a11y

---

## Execution Order

1. **`@testing-library/react` upgrade** — Do this first as it's low-risk and unblocks running tests during the formik migration
2. **`formik` → `react-hook-form`** — Migrate one form at a time, verifying tests pass after each

---

## Notes

- The `graphql` package is at `^15.8.0` while latest `@apollo/client` (3.14.1) accepts `^15.0.0 || ^16.0.0`. No action needed but consider upgrading to graphql v16 in a follow-up.
- `react-helmet-async` is already in use and React 19 compatible — the `package.json` still lists `react-helmet` and `@types/react-helmet` as dependencies which should be cleaned up (they appear unused).
