import React, { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { mount, shallow } from 'enzyme';

import store from '../../redux/store';

export const mountWithProvider = (children: ReactElement) =>
  mount(<Provider store={store}>{children}</Provider>);

export const shallowWithProvider = (children: ReactElement) =>
  shallow(<Provider store={store}>{children}</Provider>);
