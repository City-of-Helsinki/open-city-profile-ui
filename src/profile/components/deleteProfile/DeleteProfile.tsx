import React, { useCallback, useEffect, useState } from 'react';
import { ApolloError, useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { Button, Notification, useGroupConsent } from 'hds-react';
import { useNavigate } from 'react-router-dom';

import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import {
  ServiceConnectionsQueryVariables,
  ServiceConnectionsRoot,
} from '../../../graphql/typings';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import contentStyles from '../../../common/cssHelpers/content.module.css';
import ModalServicesContent from '../modals/deleteProfileContent/DeleteProfileContent';
import { useFocusSetter } from '../../hooks/useFocusSetter';
import DeleteProfileError from '../modals/deleteProfileError/DeleteProfileError';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { useScrollIntoView } from '../../hooks/useScrollIntoView';
import { DeleteResultLists } from '../../helpers/parseDeleteProfileResult';
import createServiceConnectionsQueryVariables from '../../helpers/createServiceConnectionsQueryVariables';
import Loading from '../../../common/loading/Loading';
import useAuthCodeQueues, {
  AuthCodeQueuesProps,
} from '../../../gdprApi/useAuthCodeQueues';
import config from '../../../config';
import { getDeleteProfileResultOrError } from '../../../gdprApi/actions/deleteProfile';
import reportErrorsToSentry from '../../../common/sentry/reportErrorsToSentry';
import { SERVICE_CONNECTIONS } from '../../graphql/ServiceConnectionsQuery';
import { QueueController } from '../../../common/actionQueue/actionQueue';
import useMatomo from '../../../common/matomo/hooks/useMatomo';

const notStartedLoadState = 'not-started';
const loadingLoadState = 'loading';
const loadedLoadState = 'loaded';
const errorLoadState = 'error';

function DeleteProfile(): React.ReactElement {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [dataLoadState, setDataLoadState] = useState<
    | typeof notStartedLoadState
    | typeof loadingLoadState
    | typeof loadedLoadState
    | typeof errorLoadState
  >(notStartedLoadState);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const statisticsConsent = useGroupConsent('statistics');
  const { trackEvent } = useMatomo();
  const [resultError, setResultError] = useState<
    ApolloError | Error | undefined | DeleteResultLists
  >(undefined);
  const onCompleted: AuthCodeQueuesProps['onCompleted'] = useCallback(
    (controller: QueueController) => {
      const { failures, successful } = (getDeleteProfileResultOrError(
        controller
      ).result as DeleteResultLists) || {
        failures: [],
        successful: [],
      };
      if (!failures.length) {
        if (statisticsConsent) {
          trackEvent({ category: 'action', action: 'Delete profile' });
        }
        navigate('/profile-deleted');
      } else {
        setResultError({ failures, successful });
      }
    },
    [navigate, statisticsConsent, trackEvent]
  );
  const onError: AuthCodeQueuesProps['onError'] = useCallback(
    (controller: QueueController) => {
      const failed = controller.getFailed();
      const error = new Error(failed ? failed.errorMessage : 'Unknown error');

      if (error) {
        Sentry.captureException(error);
      }
      setResultError(error);
    },
    []
  );

  const {
    startOrRestart,
    shouldResumeWithAuthCodes,
    resume,
    isLoading: isDeletingProfile,
  } = useAuthCodeQueues({
    queueName: 'deleteProfile',
    startPagePath: config.deletePath,
    language: i18n.language,
    onCompleted,
    onError,
  });

  const [removeButtonId, setFocusToRemoveButton] = useFocusSetter({
    targetId: `delete-profile-button`,
  });

  const [scrollIntoViewRef] = useScrollIntoView(isDeletingProfile);

  const handleConfirmationModal = useCallback(() => {
    setShowConfirmationModal((prevState) => !prevState);
    setFocusToRemoveButton();
  }, [setFocusToRemoveButton]);

  const [
    getServiceConnections,
    { data: serviceConnections, error: serviceConnectionsError },
  ] = useLazyQuery<ServiceConnectionsRoot, ServiceConnectionsQueryVariables>(
    SERVICE_CONNECTIONS,
    { fetchPolicy: 'no-cache' }
  );

  useEffect(() => {
    if (!serviceConnections) {
      return;
    }

    if (dataLoadState === loadedLoadState) {
      return;
    }

    setDataLoadState(loadedLoadState);
    handleConfirmationModal();
  }, [serviceConnections, dataLoadState, handleConfirmationModal]);

  useEffect(() => {
    if (!serviceConnectionsError) {
      return;
    }

    setDataLoadState(errorLoadState);
    reportErrorsToSentry(serviceConnectionsError);
  }, [serviceConnectionsError]);

  const loadServiceConnections = useCallback(
    (reloadAfterError = false) => {
      if (dataLoadState !== loadedLoadState && serviceConnections) {
        setDataLoadState(loadedLoadState);
      } else if (dataLoadState === notStartedLoadState || reloadAfterError) {
        getServiceConnections({
          variables: createServiceConnectionsQueryVariables(i18n.language),
        });
        setDataLoadState(loadingLoadState);
      }
    },
    [
      getServiceConnections,
      setDataLoadState,
      dataLoadState,
      serviceConnections,
      i18n.language,
    ]
  );

  const handleDeleteClick = () => {
    if (dataLoadState === loadingLoadState) {
      return;
    }
    if (dataLoadState === loadedLoadState) {
      handleConfirmationModal();
    } else {
      loadServiceConnections();
    }
  };

  const handleProfileDelete = async () => {
    setShowConfirmationModal(false);

    if (serviceConnections === undefined) {
      throw Error('Could not find services to delete');
    }
    startOrRestart();
  };

  useEffect(() => {
    if (shouldResumeWithAuthCodes()) {
      resume();
    }
  }, [shouldResumeWithAuthCodes, resume]);

  const LoadIndicator = ({ text }: { text: string }) => (
    <Loading
      isLoading
      loadingText={text}
      dataTestId="delete-profile-load-indicator"
      alignLeft
    />
  );
  const ServiceConnectionLoadError = () => (
    <>
      <Notification
        label={t('deleteProfile.deleteFailed')}
        type={'error'}
      ></Notification>
      <Button
        type="button"
        onClick={() => loadServiceConnections(true)}
        data-testid="reload-service-connections"
      >
        {t('notification.tryAgain')}
      </Button>
    </>
  );
  const LoadStateIndicator = () =>
    dataLoadState === errorLoadState ? (
      <ServiceConnectionLoadError />
    ) : (
      <LoadIndicator text={t('deleteProfile.loadingServices')} />
    );

  if (isDeletingProfile) {
    return (
      <div data-testid={'deleting-profile'}>
        <h2 ref={scrollIntoViewRef}>{t('deleteProfile.title')}</h2>
        <LoadIndicator text={`${t('notification.removing')}...`} />
      </div>
    );
  }
  return (
    <ProfileSection data-test-id={'delete-profile'} borderless>
      <div className={commonFormStyles['editor-description-container']}>
        <h2>{t('deleteProfile.title')}</h2>
        <p
          dangerouslySetInnerHTML={{ __html: t('deleteProfile.explanation') }}
        />
      </div>
      <div className={commonFormStyles['uneditable-box-content']}>
        <div className={contentStyles['common-child-vertical-spacing']}>
          {dataLoadState === loadingLoadState ||
          dataLoadState === errorLoadState ? (
            <LoadStateIndicator />
          ) : (
            <Button
              type="button"
              onClick={handleDeleteClick}
              id={removeButtonId}
            >
              {t('deleteProfile.delete')}
            </Button>
          )}
          <ConfirmationModal
            variant="danger"
            isOpen={showConfirmationModal}
            onClose={handleConfirmationModal}
            onConfirm={handleProfileDelete}
            content={() => <ModalServicesContent data={serviceConnections} />}
            title={t('deleteProfileModal.title')}
            actionButtonText={t('deleteProfileModal.delete')}
          />
          <DeleteProfileError
            error={resultError}
            onClose={() => setResultError(undefined)}
          />
        </div>
      </div>
    </ProfileSection>
  );
}

export default DeleteProfile;
