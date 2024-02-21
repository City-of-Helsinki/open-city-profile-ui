import React from 'react';
import { mount } from 'enzyme';
import enzymeToJson from 'enzyme-to-json';

import { updateWrapper } from '../../common/test/testUtils';
import ToastProvider from '../ToastProvider';
import useToast from '../useToast';
import { Toast } from '../types';

function TestInvoker({ toast }: { toast: Toast }) {
  const { createToast } = useToast();

  const handleClick = () => {
    createToast(toast);
  };

  return (
    <button id="create" onClick={handleClick}>
      test create
    </button>
  );
}

describe('Toast', () => {
  const toast: Toast = {
    title: 'test title',
    type: 'error',
    id: 'test-1',
    hidden: false,
  };
  const defaultProps = {
    toast,
  };
  const getWrapper = () =>
    mount(
      <ToastProvider>
        <TestInvoker {...defaultProps} />
      </ToastProvider>
    );

  beforeAll(() => {
    const toastRoot = global.document.createElement('div');

    toastRoot.setAttribute('id', 'toast-root');
    global.document.body.appendChild(toastRoot);
  });

  afterAll(() => {
    global.document.getElementById('toast-root')?.remove();
  });

  it('should render correct toast', async () => {
    const wrapper = getWrapper();

    wrapper.find('#create').simulate('click');
    await updateWrapper(wrapper);

    expect(enzymeToJson(wrapper)).toMatchSnapshot();
  });
});
