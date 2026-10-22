import { describe, expect, it } from 'vitest';

import { thirdPartyLicensesConfig } from '../thirdPartyLicenses.config';

describe('thirdPartyLicensesConfig', () => {
  // The election is the one decision in the notices that a reader cannot
  // verify from the bundle alone, so losing it has to fail a test.
  it('elects Apache-2.0 for the dual-licensed dompurify', () => {
    const decision = thirdPartyLicensesConfig.licenseDecisions?.dompurify;

    expect(decision?.license).toBe('Apache-2.0');
    expect(decision?.note).toContain('(MPL-2.0 OR Apache-2.0)');
  });

  it('lists the CSS-inlined packages the bundler cannot see', () => {
    expect(thirdPartyLicensesConfig.sassResolvedPackages).toEqual(
      expect.arrayContaining(['hds-core', 'hds-design-tokens'])
    );
  });
});
