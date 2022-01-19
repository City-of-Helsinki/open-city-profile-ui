import React from 'react';
import { render } from '@testing-library/react';

import ConfirmationModal, {
  Props as ModalComponentProps,
} from '../ConfirmationModal';
import { createDomHelpersWithTesting } from '../../../../../common/test/testingLibraryTools';
import i18n from '../../../../../common/test/testi18nInit';

type RenderProps = Pick<ModalComponentProps, 'content' | 'title'>;

describe('<ConfirmationModal /> ', () => {
  const modalId = 'confirmation-modal';
  const actionButtonText = 'actionButtonText';
  const testIds = {
    content: 'content-test-id',
    title: `${modalId}-title`,
    description: `${modalId}-description`,
    confirm: 'confirmation-modal-confirm-button',
    cancel: 'confirmation-modal-cancel-button',
  };
  const onClose = jest.fn();
  const onConfirm = jest.fn();
  const t = i18n.getFixedT('fi');

  const renderModal = ({ content, title }: RenderProps) =>
    render(
      <ConfirmationModal
        onClose={onClose}
        onConfirm={onConfirm}
        isOpen
        actionButtonText={actionButtonText}
        title={title}
        content={content}
      />
    );

  const renderAndReturnHelpers = (props: RenderProps) =>
    createDomHelpersWithTesting(renderModal(props));

  beforeEach(() => jest.resetAllMocks());

  it('Renders title when defined', async () => {
    const props = { title: 'THIS_IS_TITLE' };
    const { findById } = renderAndReturnHelpers(props);
    const title = (await findById(testIds.title)) as HTMLElement;
    expect(title).not.toBeNull();
    expect(title.innerHTML.includes(props.title)).toBeTruthy();
  });
  it('Does not render title when not defined', async () => {
    const { findById } = renderAndReturnHelpers({});
    const title = await findById(testIds.title);
    expect(title).toBeNull();
  });
  it('Renders content and description when content is defined', async () => {
    const ContentWithTestId = () => (
      <div data-testid={testIds.content}>THIS_IS_CONTENT</div>
    );
    const { findByTestId, findById } = renderAndReturnHelpers({
      content: () => <ContentWithTestId />,
    });
    const content = await findByTestId(testIds.content);
    expect(content).not.toBeNull();
    const description = await findById(testIds.description);
    expect(description).not.toBeNull();
  });
  it('Does not render content when not defined', async () => {
    const { findByTestId } = renderAndReturnHelpers({});
    const content = await findByTestId(testIds.content);
    expect(content).toBeNull();
  });
  it('Confirm button calls onConfirm', async () => {
    const ContentWithTestId = () => (
      <div data-testid={testIds.content}>THIS_IS_CONTENT</div>
    );
    const { findByTestId, click } = renderAndReturnHelpers({
      content: () => <ContentWithTestId />,
    });
    const confirmButton = (await findByTestId(testIds.confirm)) as HTMLElement;
    expect(confirmButton.innerHTML.includes(actionButtonText)).toBeTruthy();
    await click(confirmButton);
    expect(onConfirm.mock.calls).toHaveLength(1);
    expect(onClose.mock.calls).toHaveLength(0);
  });
  it('Cancel button calls onClose', async () => {
    const ContentWithTestId = () => (
      <div data-testid={testIds.content}>THIS_IS_CONTENT</div>
    );
    const { findByTestId, click } = renderAndReturnHelpers({
      content: () => <ContentWithTestId />,
    });
    const cancelButton = (await findByTestId(testIds.cancel)) as HTMLElement;
    expect(
      cancelButton.innerHTML.includes(t('confirmationModal.cancel'))
    ).toBeTruthy();
    await click(cancelButton);
    expect(onClose.mock.calls).toHaveLength(1);
    expect(onConfirm.mock.calls).toHaveLength(0);
  });
});
