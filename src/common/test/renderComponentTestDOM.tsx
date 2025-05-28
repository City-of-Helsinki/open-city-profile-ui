import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { Provider as ProfileProvider } from '../../profile/context/ProfileContext';
import { MockApolloClientProvider, ResponseProvider } from './MockApolloClientProvider';
import ToastProvider from '../../toast/__mocks__/ToastProvider';
import ProfileContextAsHTML from './ProfileContextAsHTML';

function renderComponentTestDOM(
  responseProvider: ResponseProvider,
  children: React.ReactElement,
  initialEntries: string[] = ['/'],
): RenderResult {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <MockApolloClientProvider responseProvider={responseProvider}>
        <ProfileProvider>
          <ToastProvider>{children}</ToastProvider>
          <ProfileContextAsHTML />
        </ProfileProvider>
      </MockApolloClientProvider>
      <div id='modal-container' />
    </MemoryRouter>,
  );
}

export default renderComponentTestDOM;
