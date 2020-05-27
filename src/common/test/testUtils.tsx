import React, { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';

import store from '../../redux/store';

export const mountWithProvider = (children: ReactElement) =>
  mount(<Provider store={store}>{children}</Provider>);

export const shallowWithProvider = (children: ReactElement) =>
  shallow(<Provider store={store}>{children}</Provider>);

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const updateWrapper = async (wrapper: any) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    wrapper.update();
  });
};
