import { keycloakAuthCodeCallbackUrlAction } from './authCodeCallbackUrlDetector';
import { keycloakAuthCodeParserAction } from './authCodeParser';
import { keycloakAuthCodeRedirectionAction } from './authCodeRedirectionHandler';
import { keycloakRedirectionInitializationAction } from './authCodeRedirectionInitialization';
import { createDeleteProfileAction } from './deleteProfile';
import { createDeleteServiceConnectionAction } from './deleteServiceConnection';
import { downloadAsFileAction } from './downloadAsFile';
import { getDownloadDataAction } from './getDownloadData';
import {
  getGdprDeleteScopesAction,
  getGdprQueryScopesAction,
} from './getGdprScopes';
import {
  createActionForGettingSpecificServiceConnection,
  getServiceConnectionsAction,
} from './getServiceConnections';
import { loadKeycloakConfigAction } from './loadKeycloakConfig';
import { createQueueInfoAction } from './queueInfo';
import { createRedirectorAndCatcherActionProps } from './redirectionHandlers';

export type QueueProps = {
  startPagePath: string;
  queueName: 'downloadProfile' | 'deleteProfile' | 'deleteServiceConnection';
  serviceName?: string;
  language?: string;
};

export function getQueue({
  queueName,
  startPagePath,
  serviceName,
  language,
}: QueueProps) {
  const [redirectorAction, catcherAction] =
    createRedirectorAndCatcherActionProps(startPagePath);
  const infoAction = createQueueInfoAction(queueName);
  const commonAuthCodeActions = [
    loadKeycloakConfigAction,
    keycloakRedirectionInitializationAction,
    keycloakAuthCodeRedirectionAction,
    keycloakAuthCodeCallbackUrlAction,
    keycloakAuthCodeParserAction,
    redirectorAction,
    catcherAction,
  ];
  if (queueName === 'downloadProfile') {
    return [
      getServiceConnectionsAction,
      getGdprQueryScopesAction,
      ...commonAuthCodeActions,
      getDownloadDataAction,
      downloadAsFileAction,
      infoAction,
    ];
  }
  if (queueName === 'deleteServiceConnection') {
    if (!serviceName) {
      throw new Error('Service name must be given for removeServiceConnection');
    }
    return [
      createActionForGettingSpecificServiceConnection(serviceName),
      getGdprDeleteScopesAction,
      ...commonAuthCodeActions,
      createDeleteServiceConnectionAction(serviceName),
      infoAction,
    ];
  }
  if (queueName === 'deleteProfile') {
    if (!language) {
      throw new Error('Language must be given for deleteProfile');
    }
    return [
      getServiceConnectionsAction,
      getGdprDeleteScopesAction,
      ...commonAuthCodeActions,
      createDeleteProfileAction(language),
      infoAction,
    ];
  }
  return [
    {
      type: 'error',
      executor: () => Promise.reject(new Error('Unknown queue')),
      complete: true,
      errorMessage: 'Unknown queue',
    },
  ];
}
