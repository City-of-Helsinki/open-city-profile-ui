import {
  tunnistamoAuthCodeCallbackUrlAction,
  keycloakAuthCodeCallbackUrlAction,
} from './authCodeCallbackUrlDetector';
import {
  tunnistamoAuthCodeParserAction,
  keycloakAuthCodeParserAction,
} from './authCodeParser';
import {
  tunnistamoAuthCodeRedirectionAction,
  keycloakAuthCodeRedirectionAction,
} from './authCodeRedirectionHandler';
import {
  tunnistamoRedirectionInitializationAction,
  keycloakRedirectionInitializationAction,
} from './authCodeRedirectionInitialization';
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
};

export function getQueue({
  queueName,
  startPagePath,
  serviceName,
}: QueueProps) {
  const [
    redirectorAction,
    catcherAction,
  ] = createRedirectorAndCatcherActionProps(startPagePath);
  const infoAction = createQueueInfoAction(queueName);
  if (queueName === 'downloadProfile') {
    return [
      getServiceConnectionsAction,
      getGdprQueryScopesAction,
      tunnistamoRedirectionInitializationAction,
      tunnistamoAuthCodeRedirectionAction,
      tunnistamoAuthCodeCallbackUrlAction,
      tunnistamoAuthCodeParserAction,
      loadKeycloakConfigAction,
      keycloakRedirectionInitializationAction,
      keycloakAuthCodeRedirectionAction,
      keycloakAuthCodeCallbackUrlAction,
      keycloakAuthCodeParserAction,
      redirectorAction,
      catcherAction,
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
      tunnistamoRedirectionInitializationAction,
      tunnistamoAuthCodeRedirectionAction,
      tunnistamoAuthCodeCallbackUrlAction,
      tunnistamoAuthCodeParserAction,
      loadKeycloakConfigAction,
      keycloakRedirectionInitializationAction,
      keycloakAuthCodeRedirectionAction,
      keycloakAuthCodeCallbackUrlAction,
      keycloakAuthCodeParserAction,
      redirectorAction,
      catcherAction,
      createDeleteServiceConnectionAction(serviceName),
      infoAction,
    ];
  }
  return [];
}
