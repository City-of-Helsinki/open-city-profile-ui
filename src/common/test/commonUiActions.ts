import { waitFor } from '@testing-library/react';

import { TestTools } from './testingLibraryTools';

export async function submitCreateProfileForm(
  testTools: TestTools
): Promise<void> {
  const { clickElement, isDisabled, getElement } = testTools;
  await clickElement({ id: 'create-profile-terms' });
  await waitFor(() => {
    if (isDisabled(getElement({ testId: 'create-profile-submit-button' }))) {
      throw new Error('Button is disabled');
    }
  });
  await clickElement({ testId: 'create-profile-submit-button' });
}
