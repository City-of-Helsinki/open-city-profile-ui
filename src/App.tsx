import React, { lazy, Suspense } from 'react';
import { Switch, Route } from 'react-router';
import { ApolloProvider } from '@apollo/client';
import countries from 'i18n-iso-countries';
import fi from 'i18n-iso-countries/langs/fi.json';
import en from 'i18n-iso-countries/langs/en.json';
import sv from 'i18n-iso-countries/langs/sv.json';
import { useTranslation } from 'react-i18next';

import graphqlClient from './graphql/client';
import { Provider as ProfileProvider } from './profile/context/ProfileContext';
import GdprAuthorizationCodeManagerCallback from './gdprApi/GdprAuthorizationCodeManagerCallback';
import ToastProvider from './toast/ToastProvider';
import config from './config';
import { useHistoryListener } from './profile/hooks/useHistoryListener';
import WithAuthCheck from './profile/components/withAuthCheck/WithAuthCheck';
import MatomoTracker from './common/matomo/MatomoTracker';
import { MatomoProvider } from './common/matomo/matomo-context';
import Loading from './common/loading/Loading';

countries.registerLocale(fi);
countries.registerLocale(en);
countries.registerLocale(sv);

const OidcCallback = lazy(() =>
  import('./auth/components/oidcCallback/OidcCallback')
);
const PasswordChangeCallback = lazy(() =>
  import('./passwordChange/PasswordChangeCallback')
);
const Login = lazy(() => import('./auth/components/login/Login'));
const Profile = lazy(() => import('./profile/components/profile/Profile'));
const AboutPage = lazy(() => import('./aboutPage/AboutPage'));
const UserGuide = lazy(() => import('./userGuide/UserGuide'));
const AccessibilityStatement = lazy(() =>
  import('./accessibilityStatement/AccessibilityStatement')
);
const ProfileDeleted = lazy(() =>
  import('./profile/components/profileDeleted/ProfileDeleted')
);
const ErrorPage = lazy(() =>
  import('./profile/components/errorPage/ErrorPage')
);
const LoginSSO = lazy(() => import('./auth/components/loginsso/LoginSSO'));
const CookieConsentPage = lazy(() =>
  import('./cookieConsents/CookieConsentPage')
);
const PageNotFound = lazy(() => import('./common/pageNotFound/PageNotFound'));

function App(): React.ReactElement {
  useHistoryListener();

  const matomoTracker = new MatomoTracker({
    urlBase: window._env_.REACT_APP_MATOMO_URL_BASE,
    siteId: window._env_.REACT_APP_MATOMO_SITE_ID,
    srcUrl: window._env_.REACT_APP_MATOMO_SRC_URL,
    enabled: window._env_.REACT_APP_MATOMO_ENABLED === 'true',
    configurations: {
      setDoNotTrack: true,
    },
  });

  const { t } = useTranslation();

  return (
    <ApolloProvider client={graphqlClient}>
      <ToastProvider>
        <MatomoProvider value={matomoTracker}>
          <ProfileProvider>
            <Suspense
              fallback={
                <Loading isLoading loadingText={t('profile.loading')} />
              }
            >
              <Switch>
                <Route path="/callback" component={OidcCallback} />
                <Route path="/gdpr-callback">
                  <GdprAuthorizationCodeManagerCallback />
                </Route>
                <Route
                  path="/password-change-callback"
                  component={PasswordChangeCallback}
                ></Route>
                <Route path="/login">
                  <Login />
                </Route>
                <Route path={['/', '/connected-services']} exact>
                  <WithAuthCheck
                    AuthenticatedComponent={Profile}
                  ></WithAuthCheck>
                </Route>
                <Route path="/about" exact>
                  <AboutPage />
                </Route>
                <Route path="/guide" exact>
                  <UserGuide />
                </Route>
                <Route path="/accessibility" exact>
                  <AccessibilityStatement />
                </Route>
                <Route path="/profile-deleted" exact>
                  <ProfileDeleted />
                </Route>
                <Route path={config.errorPagePath} exact>
                  <ErrorPage />
                </Route>
                <Route path={config.autoSSOLoginPath} exact>
                  <LoginSSO />
                </Route>
                <Route path={config.cookiePagePath} exact>
                  <CookieConsentPage />
                </Route>
                <Route path="*">
                  <PageNotFound />
                </Route>
              </Switch>
            </Suspense>
          </ProfileProvider>
        </MatomoProvider>
      </ToastProvider>
    </ApolloProvider>
  );
}

export default App;
