import {
  keycloakAuthCodeCallbackUrlAction,
  tunnistamoAuthCodeCallbackUrlAction,
} from '../authCodeCallbackUrlDetector';
import {
  keycloakAuthCodeParserAction,
  tunnistamoAuthCodeParserAction,
} from '../authCodeParser';
import {
  keycloakAuthCodeRedirectionAction,
  tunnistamoAuthCodeRedirectionAction,
} from '../authCodeRedirectionHandler';
import {
  keycloakRedirectionInitializationAction,
  tunnistamoRedirectionInitializationAction,
} from '../authCodeRedirectionInitialization';
import { downloadAsFileAction } from '../downloadAsFile';
import { getDownloadDataAction } from '../getDownloadData';
import { getGdprQueryScopesAction } from '../getGdprScopes';
import { getServiceConnectionsAction } from '../getServiceConnections';
import { loadKeycloakConfigAction } from '../loadKeycloakConfig';
import {
  redirectToDownloadAction,
  waitForDownloadPageRedirectionAction,
} from '../redirectionHandlers';
import { ActionMockData } from './mock.util';

type ScenarioProps = Pick<
  ActionMockData,
  'store' | 'storeAsActive' | 'runOriginal' | 'autoTrigger'
> & { overrides?: ActionMockData[] };

export const tunnistamoState = 'tunnistamo-state';
export const keycloakState = 'keycloak-state';
export const tunnistamoCode = 'tunnistamo-code';
export const keycloakCode = 'keycloak-code';
export const tunnistamoOidcUri = 'tunnistamo.hel.ninja';
export const keycloakOidcUri = 'keycloak.hel.ninja';

export function modifyScenario(
  props: ActionMockData[],
  newProps: ActionMockData[]
): ActionMockData[] {
  return props.map(item => {
    const overrides = newProps.find(p => p.type === item.type);
    if (overrides) {
      return {
        ...item,
        ...overrides,
      };
    }
    return item;
  });
}

export function getScenarioForScopes({
  hasKeycloakScopes = true,
  hasTunnistamoScopes = true,
  overrides,
  ...rest
}: ScenarioProps & {
  hasKeycloakScopes?: boolean;
  hasTunnistamoScopes?: boolean;
} = {}): ActionMockData[] {
  const list = [
    {
      type: getServiceConnectionsAction.type,
      resolveValue: true,
      ...rest,
    },
    {
      type: getGdprQueryScopesAction.type,
      resolveValue: {
        keycloakScopes: hasKeycloakScopes
          ? ['keycloak-scope1', 'keycloak-scope2']
          : [],
        tunnistamoScopes: hasTunnistamoScopes
          ? ['tunnistamo-scope1', 'tunnistamo-scope2']
          : [],
      },
      ...rest,
    },
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

export function getScenarioForTunnistamoAuth({
  state = tunnistamoState,
  oidcUri = tunnistamoOidcUri,
  code = tunnistamoCode,
  overrides,
  ...rest
}: ScenarioProps & {
  state?: string;
  oidcUri?: string;
  code?: string;
} = {}): ActionMockData[] {
  const list = [
    {
      type: tunnistamoRedirectionInitializationAction.type,
      resolveValue: {
        state,
        oidcUri,
      },
      ...rest,
    },
    {
      type: tunnistamoAuthCodeRedirectionAction.type,
      resolveValue: true,
      ...rest,
    },
    {
      type: tunnistamoAuthCodeCallbackUrlAction.type,
      resolveValue: true,
      ...rest,
    },
    {
      type: tunnistamoAuthCodeParserAction.type,
      resolveValue: code,
      ...rest,
    },
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

export function getScenarioForKeycloakAuth({
  state = keycloakState,
  oidcUri = keycloakOidcUri,
  code = keycloakCode,
  overrides,
  ...rest
}: ScenarioProps & {
  state?: string;
  oidcUri?: string;
  code?: string;
} = {}): ActionMockData[] {
  const list = [
    {
      type: loadKeycloakConfigAction.type,
      resolveValue: keycloakOidcUri,
      ...rest,
    },
    {
      type: keycloakRedirectionInitializationAction.type,
      resolveValue: {
        state,
        oidcUri,
      },
      ...rest,
    },
    {
      type: keycloakAuthCodeRedirectionAction.type,
      resolveValue: true,
      ...rest,
    },
    {
      type: keycloakAuthCodeCallbackUrlAction.type,
      resolveValue: true,
      ...rest,
    },
    {
      type: keycloakAuthCodeParserAction.type,
      resolveValue: code,
      ...rest,
    },
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

export function getScenarioForDownloadPageRedirect({
  runOriginal = true,
  overrides,
  ...rest
}: ScenarioProps = {}): ActionMockData[] {
  const list = [
    {
      type: redirectToDownloadAction.type,
      runOriginal,
      ...rest,
    },
    {
      type: waitForDownloadPageRedirectionAction.type,
      runOriginal,
      ...rest,
    },
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

export function getScenarioForDownloadData({
  overrides,
  ...rest
}: ScenarioProps & {
  hasKeycloakScopes?: boolean;
  hasTunnistamoScopes?: boolean;
} = {}): ActionMockData[] {
  const list = [
    {
      type: getDownloadDataAction.type,
      resolveValue: { key1: 'key1', key2: 'key2' },
      ...rest,
    },
    {
      type: downloadAsFileAction.type,
      resolveValue: true,
      ...rest,
    },
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

// next action is tunnistamoAuthCodeCallbackUrlAction
// actions before it are stored and complete
// keycloak auth code is not needed, because there are no keylocak scopes
export function getScenarioWhichGoesFromStartToAuthRedirectAutomatically({
  overrides,
}: ScenarioProps = {}) {
  const list = [
    ...getScenarioForScopes({ autoTrigger: true }),
    ...getScenarioForTunnistamoAuth({
      overrides: [
        {
          type: tunnistamoRedirectionInitializationAction.type,
          autoTrigger: true,
        },
      ],
    }),
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

// next action is tunnistamoAuthCodeCallbackUrlAction
// actions before it are stored and complete
// keycloak auth code is not needed, because there are no keylocak scopes
export function getScenarioWhereNextPhaseIsResumeCallback({
  overrides,
}: ScenarioProps = {}) {
  const list = [
    ...getScenarioForScopes({ store: true, hasKeycloakScopes: false }),
    ...getScenarioForTunnistamoAuth({
      store: true,
      overrides: [
        {
          type: tunnistamoAuthCodeCallbackUrlAction.type,
          store: false,
          autoTrigger: true,
        },
        {
          type: tunnistamoAuthCodeParserAction.type,
          store: false,
          autoTrigger: true,
        },
      ],
    }),
    ...getScenarioForKeycloakAuth({ runOriginal: true }),
    ...getScenarioForDownloadPageRedirect({
      autoTrigger: true,
      runOriginal: true,
    }),
    ...getScenarioForDownloadData(),
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

// auth codes are fetched, user has been redirected back to download page
// next action is waitForDownloadPageRedirectionAction
export function getScenarioWhereNextPhaseIsResumeDownload({
  overrides,
}: ScenarioProps = {}) {
  const list = [
    ...getScenarioForScopes({ store: true, hasKeycloakScopes: false }),
    ...getScenarioForTunnistamoAuth({
      store: true,
    }),
    ...getScenarioForKeycloakAuth({ store: true }),
    ...getScenarioForDownloadPageRedirect({
      store: true,
      overrides: [
        {
          type: waitForDownloadPageRedirectionAction.type,
          store: false,
        },
      ],
    }),
    ...getScenarioForDownloadData({ autoTrigger: true }),
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

// next action is keycloakAuthCodeCallbackUrlAction
// url must be set to gdprcallback url with state=keycloak-state&(code does not matter)
export function getScenarioWhereKeycloakAuthCodeNotInUrl({
  overrides,
}: ScenarioProps = {}) {
  const list = [
    ...getScenarioForScopes({ store: true }),
    ...getScenarioForTunnistamoAuth({
      store: true,
    }),
    ...getScenarioForKeycloakAuth({
      store: true,
      overrides: [
        {
          type: keycloakAuthCodeCallbackUrlAction.type,
          resolveValue: true,
          store: false,
        },
        {
          type: keycloakAuthCodeParserAction.type,
          runOriginal: true,
          store: false,
        },
      ],
    }),
    ...getScenarioForDownloadPageRedirect(),
    ...getScenarioForDownloadData(),
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}
export function getScenarioWhereEveryActionCanBeManuallyCompletetedSuccessfully({
  overrides,
}: ScenarioProps = {}) {
  const list = [
    ...getScenarioForScopes(),
    ...getScenarioForTunnistamoAuth(),
    ...getScenarioForKeycloakAuth(),
    ...getScenarioForDownloadPageRedirect({
      overrides: [
        {
          type: redirectToDownloadAction.type,
          runOriginal: false,
          resolveValue: true,
        },
        {
          type: waitForDownloadPageRedirectionAction.type,
          runOriginal: false,
          resolveValue: true,
        },
      ],
    }),
    ...getScenarioForDownloadData(),
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}
