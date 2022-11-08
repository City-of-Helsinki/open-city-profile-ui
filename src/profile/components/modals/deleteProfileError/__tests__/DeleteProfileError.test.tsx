import React from 'react';
import { render } from '@testing-library/react';

import DeleteProfileError, { Props } from '../DeleteProfileError';
import { createDomHelpersWithTesting } from '../../../../../common/test/testingLibraryTools';
import i18n from '../../../../../common/test/testi18nInit';
import { getDeleteMyProfileMutationResult } from '../../../../../common/test/getDeleteMyProfileMutationResult';
import parseDeleteProfileResult from '../../../../helpers/parseDeleteProfileResult';

describe('<DeleteProfileError /> ', () => {
  const modalId = 'delete-profile-error-modal';
  const testIds = {
    title: `${modalId}-title`,
    description: `${modalId}-description`,
    close: `${modalId}-close-button`,
    successList: `delete-profile-success-list`,
    failureList: `delete-profile-failure-list`,
  };
  const basicError = new Error('Error');

  const resultsWithUnsuccessfulDeletions = parseDeleteProfileResult(
    getDeleteMyProfileMutationResult(['', 'errorCode'])
  );

  const onClose = jest.fn();
  const t = i18n.getFixedT('fi');

  const renderAndReturnHelpers = (error?: Props['error']) =>
    createDomHelpersWithTesting(
      render(<DeleteProfileError onClose={onClose} error={error} />)
    );

  beforeEach(() => jest.resetAllMocks());

  it('Renders modal when error is defined', async () => {
    const { findById } = renderAndReturnHelpers(basicError);
    const modal = await findById(modalId);
    expect(modal).toBeDefined();
    const title = (await findById(testIds.title)) as HTMLElement;
    const description = (await findById(testIds.description)) as HTMLElement;
    expect(
      title.innerHTML.includes(t('deleteProfileModal.deletionErrorTitle'))
    ).toBeTruthy();
    expect(
      description.innerHTML.includes(t('deleteProfile.deleteFailed'))
    ).toBeTruthy();
    expect(onClose.mock.calls).toHaveLength(0);
  });

  it('When results include failed services, a list is displayed', async () => {
    const { findById, findByTestId } = renderAndReturnHelpers(
      resultsWithUnsuccessfulDeletions
    );
    const description = (await findById(testIds.description)) as HTMLElement;
    expect(description).toBeNull();
    const successList = await findByTestId(testIds.successList);
    const failureList = await findByTestId(testIds.failureList);
    expect(successList).not.toBeNull();
    expect(failureList).not.toBeNull();
    expect(failureList?.childNodes).toHaveLength(
      resultsWithUnsuccessfulDeletions.failures.length
    );
    expect(successList?.childNodes).toHaveLength(
      resultsWithUnsuccessfulDeletions.successful.length
    );
  });
  it('When results does not include failed services, a list is not displayed', async () => {
    const { findById, findByTestId } = renderAndReturnHelpers({
      ...resultsWithUnsuccessfulDeletions,
      failures: [],
    });
    const description = (await findById(testIds.description)) as HTMLElement;
    expect(description).not.toBeNull();
    const successList = await findByTestId(testIds.successList);
    const failureList = await findByTestId(testIds.failureList);
    expect(successList).toBeNull();
    expect(failureList).toBeNull();
  });

  it('Does not render modal when error is not defined', async () => {
    const { findById } = renderAndReturnHelpers();
    const modal = await findById(modalId);
    expect(modal).toBeNull();
  });

  it('Close button calls onClose', async () => {
    const { findByTestId, click } = renderAndReturnHelpers(basicError);
    const closeButton = (await findByTestId(testIds.close)) as HTMLElement;
    await click(closeButton);
    expect(onClose.mock.calls).toHaveLength(1);
  });
});
