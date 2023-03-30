import React from 'react';
import classNames from 'classnames';
import { User } from 'oidc-client-ts';

import PageLayout from '../../../common/pageLayout/PageLayout';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import StyledButton from '../../../common/styledButton/StyledButton';
import { useLoginClient } from '../../../auth/LoginContext';
import WithAuthentication from '../../../auth/WithAuthentication';

function LoginTesterPage(): React.ReactElement {
  const { login } = useLoginClient();
  return (
    <PageLayout
      title={'Test'}
      data-testid="error-page-layout"
      focusElementSelector={
        '*[data-testid="error-page-notification"] *[role="heading"]'
      }
    >
      <div
        className={classNames([
          commonContentStyles['common-content-area'],
          commonContentStyles['common-vertical-padding'],
        ])}
      >
        <WithAuthentication
          UnauthorisedComponent={() => (
            <StyledButton
              onClick={() => login()}
              data-testid={'error-page-login-button'}
            >
              Login
            </StyledButton>
          )}
          AuthorisedComponent={(props: { user: User }) => (
            <div>Hello {props.user.profile.given_name}</div>
          )}
        />
      </div>
    </PageLayout>
  );
}

export default LoginTesterPage;
