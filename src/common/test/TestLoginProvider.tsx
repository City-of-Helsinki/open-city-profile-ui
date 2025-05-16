import React from 'react';
import { LoginProvider, LoginProviderProps } from 'hds-react';

const providerProperties: LoginProviderProps = {
  userManagerSettings: {},
  debug: true,
};

const TestLoginProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <LoginProvider {...providerProperties}>{children}</LoginProvider>;

export default TestLoginProvider;
