import React from 'react';
import { mount } from 'enzyme';
import enzymeToJson from 'enzyme-to-json';

import { updateWrapper } from '../../common/test/testUtils';
import ToastProvider from '../ToastProvider';
import useToast from '../useToast';

function TestInvoker({ toast }) {
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
  const toast = {
    title: 'test title',
    type: 'error',
    id: 'test-1',
  };
  const defaultProps = {
    toast,
  };
  const getWrapper = props =>
    mount(
      <ToastProvider>
        <TestInvoker {...defaultProps} {...props} />
      </ToastProvider>
    );

  beforeAll(() => {
    const toastRoot = global.document.createElement('div');

    toastRoot.setAttribute('id', 'toast-root');
    global.document.body.appendChild(toastRoot);
  });

  afterAll(() => {
    global.document.getElementById('toast').remove();
  });

  it('should render correct toast', async () => {
    const wrapper = getWrapper();

    wrapper.find('#create').simulate('click');
    await updateWrapper(wrapper);

    expect(enzymeToJson(wrapper)).toMatchSnapshot();
  });
});
