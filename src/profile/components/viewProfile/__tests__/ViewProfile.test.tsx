import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import ViewProfile from '../ViewProfile';
import { ProfileContext, ProfileContextData } from '../../../context/ProfileContext';

// Mock the child components
vi.mock('../../profileInformation/ProfileInformation', () => ({
  default: () => <div data-testid='profile-information'>Profile Information</div>,
}));

vi.mock('../../serviceConnections/ServiceConnections', () => ({
  default: () => <div data-testid='service-connections'>Service Connections</div>,
}));

const PROFILE_INFORMATION = 'profile-information';
const SERVICE_CONNECTIONS = 'service-connections';

describe('ViewProfile', () => {
  // Create a mock ProfileContext
  const createProfileContextValue = (isComplete = true): ProfileContextData => ({
    isComplete,
    isInitialized: true,
    data: {
      myProfile: null,
    },
    error: undefined,
    fetch: vi.fn(),
    updateProfileData: vi.fn(),
    loading: false,
    addErrorListener: vi.fn(),
    refetch: vi.fn(),
    getName: vi.fn(),
    getProfile: vi.fn(),
    passwordUpdateState: false,
    setPasswordUpdateState: function (): void {
      throw new Error('Mock');
    },
    otpConfigurationState: false,
    setOtpConfigurationState: function (): void {
      throw new Error('Function not implemented.');
    },
    otpDeleteState: false,
    setOtpDeleteState: function (): void {
      throw new Error('Function not implemented.');
    },
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders ProfileInformation when route is "/"', () => {
    render(
      <ProfileContext.Provider value={createProfileContextValue()}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path='/*' element={<ViewProfile />} />
          </Routes>
        </MemoryRouter>
      </ProfileContext.Provider>,
    );

    expect(screen.getByTestId(PROFILE_INFORMATION)).toBeInTheDocument();
    expect(screen.queryByTestId(SERVICE_CONNECTIONS)).not.toBeInTheDocument();
  });

  it('renders ServiceConnections when route is "/connected-services"', () => {
    render(
      <ProfileContext.Provider value={createProfileContextValue()}>
        <MemoryRouter initialEntries={['/connected-services']}>
          <Routes>
            <Route path='/*' element={<ViewProfile />} />
          </Routes>
        </MemoryRouter>
      </ProfileContext.Provider>,
    );

    expect(screen.getByTestId(SERVICE_CONNECTIONS)).toBeInTheDocument();
    expect(screen.queryByTestId(PROFILE_INFORMATION)).not.toBeInTheDocument();
  });

  it('renders nothing when isComplete is false', () => {
    render(
      <ProfileContext.Provider value={createProfileContextValue(false)}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path='/*' element={<ViewProfile />} />
          </Routes>
        </MemoryRouter>
      </ProfileContext.Provider>,
    );

    expect(screen.queryByTestId(PROFILE_INFORMATION)).not.toBeInTheDocument();
    expect(screen.queryByTestId(SERVICE_CONNECTIONS)).not.toBeInTheDocument();
  });
});
