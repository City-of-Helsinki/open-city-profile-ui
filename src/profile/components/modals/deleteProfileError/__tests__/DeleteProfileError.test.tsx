import React from 'react';
import { render } from '@testing-library/react';
import { ApolloError } from '@apollo/client';

import DeleteProfileError, { Props } from '../DeleteProfileError';
import { createDomHelpersWithTesting } from '../../../../../common/test/testingLibraryTools';
import i18n from '../../../../../common/test/testi18nInit';

describe('<DeleteProfileError /> ', () => {
  const modalId = 'delete-profile-error-modal';
  const testIds = {
    title: `${modalId}-title`,
    description: `${modalId}-description`,
    close: `${modalId}-close-button`,
  };
  const basicError = new Error('Error');
  const notAllowedApolloError = ({
    graphQLErrors: [
      {
        message: '',
        extensions: { code: '' },
      },
      {
        message: '',
        extensions: { code: 'CONNECTED_SERVICE_DELETION_NOT_ALLOWED_ERROR' },
      },
    ],
  } as unknown) as ApolloError;

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
      title.innerHTML.includes(t('deleteProfileErrorModal.title'))
    ).toBeTruthy();
    expect(
      description.innerHTML.includes(t('deleteProfileErrorModal.genericError'))
    ).toBeTruthy();
    expect(onClose.mock.calls).toHaveLength(0);
  });

  it('Renders different description when error is a "CONNECTED_SERVICE_DELETION_NOT_ALLOWED_ERROR"', async () => {
    const { findById } = renderAndReturnHelpers(notAllowedApolloError);
    const description = (await findById(testIds.description)) as HTMLElement;
    expect(
      description.innerHTML.includes(t('deleteProfileErrorModal.notAllowed'))
    ).toBeTruthy();
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
