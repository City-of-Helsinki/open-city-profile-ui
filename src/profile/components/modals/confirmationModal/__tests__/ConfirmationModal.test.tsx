import React from 'react';
import { fireEvent, render, RenderResult } from '@testing-library/react';
import to from 'await-to-js';

import ConfirmationModal, {
  Props as ModalComponentProps,
} from '../ConfirmationModal';

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
  const renderModal = ({
    content,
    title,
  }: Pick<ModalComponentProps, 'content' | 'title'>) =>
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

  const createDomHelpersWithTesting = (renderResult: RenderResult) => ({
    findByTestId: async (testId: string): Promise<HTMLElement | null> => {
      const [, el] = await to(renderResult.findByTestId(testId));
      return Promise.resolve(el || null);
    },
    findById: async (id: string): Promise<HTMLElement | null> => {
      const el = renderResult.baseElement.querySelector(`#${id}`);
      return Promise.resolve((el as HTMLElement) || null);
    },
    click: async (target: HTMLElement) => {
      expect(!!target).toBeTruthy();
      fireEvent.click(target as Element);
      Promise.resolve();
    },
  });

  beforeEach(() => jest.resetAllMocks());

  it('Renders title when defined', async () => {
    const props = { title: 'THIS_IS_TITLE' };
    const result = renderModal(props);
    const { findById } = createDomHelpersWithTesting(result);
    const title = (await findById(testIds.title)) as HTMLElement;
    expect(title).not.toBeNull();
    expect(title.innerHTML.includes(props.title)).toBeTruthy();
  });
  it('Does not render title when not defined', async () => {
    const result = renderModal({});
    const { findById } = createDomHelpersWithTesting(result);
    const title = await findById(testIds.title);
    expect(title).toBeNull();
  });
  it('Renders content and description when content is defined', async () => {
    const ContentWithTestId = () => (
      <div data-testid={testIds.content}>THIS_IS_CONTENT</div>
    );
    const result = renderModal({ content: () => <ContentWithTestId /> });
    const { findByTestId, findById } = createDomHelpersWithTesting(result);
    const content = await findByTestId(testIds.content);
    expect(content).not.toBeNull();
    const description = await findById(testIds.description);
    expect(description).not.toBeNull();
  });
  it('Does not render content when not defined', async () => {
    const result = renderModal({});
    const { findByTestId } = createDomHelpersWithTesting(result);
    const content = await findByTestId(testIds.content);
    expect(content).toBeNull();
  });
  it('Confirm button calls onConfirm', async () => {
    const ContentWithTestId = () => (
      <div data-testid={testIds.content}>THIS_IS_CONTENT</div>
    );
    const result = renderModal({ content: () => <ContentWithTestId /> });
    const { findByTestId, click } = createDomHelpersWithTesting(result);
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
    const result = renderModal({ content: () => <ContentWithTestId /> });
    const { findByTestId, click } = createDomHelpersWithTesting(result);
    const cancelButton = (await findByTestId(testIds.cancel)) as HTMLElement;
    expect(cancelButton.innerHTML.includes('cancel')).toBeTruthy();
    await click(cancelButton);
    expect(onClose.mock.calls).toHaveLength(1);
    expect(onConfirm.mock.calls).toHaveLength(0);
  });
});
