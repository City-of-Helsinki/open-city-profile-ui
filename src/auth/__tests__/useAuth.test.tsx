import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';

import useAuth from '../useAuth';
import TestLoginProvider from '../../common/test/TestLoginProvider';

describe('useAuth', () => {
  // Simple test component that uses the useAuth hook
  const TestComponent = () => {
    const { getUser, logout, changePassword } = useAuth();

    return <div></div>;
  };

  it('should render', () => {
    render(
      <TestLoginProvider>
        <TestComponent />
      </TestLoginProvider>
    );
  });
});
