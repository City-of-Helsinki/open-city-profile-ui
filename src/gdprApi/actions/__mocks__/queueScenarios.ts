import { DeleteResultLists } from '../../../profile/helpers/parseDeleteProfileResult';
import { keycloakAuthCodeCallbackUrlAction } from '../authCodeCallbackUrlDetector';
import { keycloakAuthCodeParserAction } from '../authCodeParser';
import { keycloakAuthCodeRedirectionAction } from '../authCodeRedirectionHandler';
import { keycloakRedirectionInitializationAction } from '../authCodeRedirectionInitialization';
import { deleteProfileType } from '../deleteProfile';
import { deleteServiceConnectionType } from '../deleteServiceConnection';
import { downloadAsFileAction } from '../downloadAsFile';
import { getDownloadDataAction } from '../getDownloadData';
import { getGdprDeleteScopesAction, getGdprQueryScopesAction } from '../getGdprScopes';
import { getServiceConnectionsAction } from '../getServiceConnections';
import { loadKeycloakConfigAction } from '../loadKeycloakConfig';
import { queueInfoActionType } from '../queueInfo';
import { defaultRedirectionCatcherActionType, defaultRedirectorActionType } from '../redirectionHandlers';
import { ActionMockData } from '../../../common/actionQueue/mock.util';

type ScenarioProps = Pick<ActionMockData, 'store' | 'storeAsActive' | 'runOriginal' | 'autoTrigger'> & {
  overrides?: ActionMockData[];
};

export const keycloakState = 'keycloak-state';
export const keycloakCode = 'keycloak-code';
export const keycloakOidcUri = 'keycloak.hel.ninja';

export function modifyScenario(props: ActionMockData[], newProps: ActionMockData[]): ActionMockData[] {
  return props.map((item) => {
    const overrides = newProps.find((p) => p.type === item.type);
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
  hasDeleteScopes = false,
  overrides,
  ...rest
}: ScenarioProps & {
  hasKeycloakScopes?: boolean;
  hasDeleteScopes?: boolean;
} = {}): ActionMockData[] {
  const list = [
    {
      type: getServiceConnectionsAction.type,
      resolveValue: true,
      ...rest,
    },
    {
      type: hasDeleteScopes ? getGdprDeleteScopesAction.type : getGdprQueryScopesAction.type,
      resolveValue: {
        keycloakScopes: hasKeycloakScopes ? ['keycloak-scope1', 'keycloak-scope2'] : [],
      },
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

export function getScenarioForStartPageRedirect({
  runOriginal = true,
  overrides,
  ...rest
}: ScenarioProps = {}): ActionMockData[] {
  const list = [
    {
      type: defaultRedirectorActionType,
      runOriginal,
      ...rest,
    },
    {
      type: defaultRedirectionCatcherActionType,
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

export function getScenarioForAutoTriggeringQueueInfo({ ...rest }: ScenarioProps = {}): ActionMockData[] {
  return [
    {
      type: queueInfoActionType,
      runOriginal: true,
      autoTrigger: true,
      ...rest,
    },
  ];
}

export function getScenarioForDeleteServiceConnection({
  overrides,
  serviceName,
  ...rest
}: ScenarioProps & {
  serviceName?: string;
} = {}): ActionMockData[] {
  const list = [
    {
      type: deleteServiceConnectionType,
      resolveValue: true,
      options: {
        data: {
          serviceName,
        },
      },
      ...rest,
    },
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

export function getScenarioForDeleteProfile({
  overrides,
  results = { failures: [], successful: ['serviceX'] },
  error,
  ...rest
}: ScenarioProps & {
  results?: DeleteResultLists;
  error?: boolean;
} = {}): ActionMockData[] {
  const list = [
    {
      type: deleteProfileType,
      resolveValue: error ? undefined : results,
      rejectValue: error ? new Error('Failed') : undefined,
      ...rest,
    },
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

// next action is keycloakAuthCodeCallbackUrlAction
// actions before it are stored and complete
// keycloak auth code is not needed, because there are no keylocak scopes
export function getScenarioWhichGoesFromStartToAuthRedirectAutomatically({ overrides }: ScenarioProps = {}) {
  const list = [
    ...getScenarioForScopes({ autoTrigger: true }),
    ...getScenarioForKeycloakAuth({
      overrides: [
        {
          type: keycloakRedirectionInitializationAction.type,
          autoTrigger: true,
        },
      ],
    }),
    ...getScenarioForAutoTriggeringQueueInfo(),
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

// next action is keycloakAuthCodeCallbackUrlAction
// actions before it are stored and complete
// keycloak auth code is not needed, because there are no keylocak scopes
export function getScenarioWhereNextPhaseIsResumeCallback({ overrides }: ScenarioProps = {}) {
  const list = [
    ...getScenarioForScopes({ store: true, hasKeycloakScopes: false }),
    ...getScenarioForKeycloakAuth({
      store: true,
      overrides: [
        {
          type: keycloakAuthCodeCallbackUrlAction.type,
          store: false,
          autoTrigger: true,
        },
        {
          type: keycloakAuthCodeParserAction.type,
          store: false,
          autoTrigger: true,
        },
      ],
    }),
    ...getScenarioForStartPageRedirect({
      autoTrigger: true,
      runOriginal: true,
    }),
    ...getScenarioForDownloadData(),
    ...getScenarioForAutoTriggeringQueueInfo(),
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

// auth codes are fetched, user has been redirected back to download page
// next action is waitForStartPageRedirectionAction
export function getScenarioWhereNextPhaseIsResumeDownload({ overrides }: ScenarioProps = {}) {
  const list = [
    ...getScenarioForScopes({ store: true, hasKeycloakScopes: false }),
    ...getScenarioForKeycloakAuth({ store: true }),
    ...getScenarioForStartPageRedirect({
      store: true,
      overrides: [
        {
          type: defaultRedirectionCatcherActionType,
          store: false,
        },
      ],
    }),
    ...getScenarioForDownloadData({ autoTrigger: true }),
    ...getScenarioForAutoTriggeringQueueInfo(),
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

// next action is keycloakAuthCodeCallbackUrlAction
// url must be set to gdprcallback url with state=keycloak-state&(code does not matter)
export function getScenarioWhereKeycloakAuthCodeNotInUrl({ overrides }: ScenarioProps = {}) {
  const list = [
    ...getScenarioForScopes({ store: true }),
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
    ...getScenarioForStartPageRedirect(),
    ...getScenarioForDownloadData(),
    ...getScenarioForAutoTriggeringQueueInfo(),
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}
export function getScenarioWhereEveryActionCanBeManuallyCompletetedSuccessfully({ overrides }: ScenarioProps = {}) {
  const list = [
    ...getScenarioForScopes(),
    ...getScenarioForKeycloakAuth(),
    ...getScenarioForStartPageRedirect({
      overrides: [
        {
          type: defaultRedirectorActionType,
          runOriginal: true,
          resolveValue: true,
        },
        {
          type: defaultRedirectionCatcherActionType,
          runOriginal: false,
          resolveValue: true,
        },
      ],
    }),
    ...getScenarioForDownloadData(),
    ...getScenarioForAutoTriggeringQueueInfo(),
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

export function getScenarioWhereDeleteServiceConnectionIsResumable({
  overrides,
  serviceName,
}: ScenarioProps & { serviceName?: string } = {}) {
  const list = [
    ...getScenarioForScopes({ store: true, hasDeleteScopes: true }),
    ...getScenarioForKeycloakAuth({
      store: true,
    }),
    ...getScenarioForStartPageRedirect({
      store: true,
      overrides: [
        {
          type: defaultRedirectionCatcherActionType,
          store: false,
          autoTrigger: true,
        },
      ],
    }),
    ...getScenarioForDeleteServiceConnection({
      serviceName,
      autoTrigger: true,
    }),
    ...getScenarioForAutoTriggeringQueueInfo(),
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

export function getScenarioWhereDeleteProfileCanStartAndProceedToRedirection({
  overrides,
}: ScenarioProps & { serviceName?: string } = {}) {
  const list = [
    ...getScenarioForScopes({ hasDeleteScopes: true, autoTrigger: true }),
    ...getScenarioForKeycloakAuth({ autoTrigger: true }),
    ...getScenarioForStartPageRedirect({ autoTrigger: true }),
    ...getScenarioForDeleteProfile(),
    ...getScenarioForAutoTriggeringQueueInfo(),
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

export function getScenarioWhereDeleteProfileIsResumable({
  overrides,
  results,
  error,
}: ScenarioProps & {
  results?: DeleteResultLists;
  error?: boolean;
} = {}) {
  const list = [
    ...getScenarioForScopes({ store: true, hasDeleteScopes: true }),
    ...getScenarioForKeycloakAuth({
      store: true,
    }),
    ...getScenarioForStartPageRedirect({
      store: true,
      overrides: [
        {
          type: defaultRedirectionCatcherActionType,
          store: false,
          autoTrigger: true,
        },
      ],
    }),
    ...getScenarioForDeleteProfile({
      autoTrigger: true,
      results,
      error,
    }),
    ...getScenarioForAutoTriggeringQueueInfo(),
  ];
  if (overrides) {
    return modifyScenario(list, overrides);
  }
  return list;
}

export function getScenarioWithoutScopesWillAutoComplete() {
  return getScenarioWhereEveryActionCanBeManuallyCompletetedSuccessfully({
    overrides: [
      {
        type: getGdprQueryScopesAction.type,
        resolveValue: {
          keycloakScopes: [],
        },
      },
    ],
  }).map((data) => ({ ...data, autoTrigger: true }));
}
