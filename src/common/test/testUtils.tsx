import { ReactElement } from 'react';
import { mount, shallow, ReactWrapper, ShallowWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';

export const mountWithProvider = (children: ReactElement): ReactWrapper =>
  mount(children);

export const shallowWithProvider = (children: ReactElement): ShallowWrapper =>
  shallow(children);

export const updateWrapper = async (wrapper: ReactWrapper): Promise<void> => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    wrapper.update();
  });
};

export const waitForTimeout = async (time = 0): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, time));
};
