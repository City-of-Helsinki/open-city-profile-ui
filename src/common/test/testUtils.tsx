import { ReactElement } from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';

export const mountWithProvider = (children: ReactElement) => mount(children);

export const shallowWithProvider = (children: ReactElement) =>
  shallow(children);

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const updateWrapper = async (wrapper: any) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    wrapper.update();
  });
};
