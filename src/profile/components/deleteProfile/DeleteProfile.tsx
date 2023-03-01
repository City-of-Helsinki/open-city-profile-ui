import React, { useCallback, useState } from 'react';
import { ApolloError, useLazyQuery } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';
import { Notification } from 'hds-react';
import { useHistory } from 'react-router';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import {
  ServiceConnectionsQueryVariables,
  ServiceConnectionsRoot,
} from '../../../graphql/typings';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import useDeleteProfile from '../../../gdprApi/useDeleteProfile';
import ModalServicesContent from '../modals/deleteProfileContent/DeleteProfileContent';
import { useFocusSetter } from '../../hooks/useFocusSetter';
import DeleteProfileError from '../modals/deleteProfileError/DeleteProfileError';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { useScrollIntoView } from '../../hooks/useScrollIntoView';
import parseDeleteProfileResult, {
  DeleteResultLists,
} from '../../helpers/parseDeleteProfileResult';
import createServiceConnectionsQueryVariables from '../../helpers/createServiceConnectionsQueryVariables';
import Loading from '../../../common/loading/Loading';
import StyledButton from '../../../common/styledButton/StyledButton';

const SERVICE_CONNECTIONS = loader(
  '../../graphql/ServiceConnectionsQuery.graphql'
);

function DeleteProfile(): React.ReactElement {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const notStartedLoadState = 'not-started';
  const loadingLoadState = 'loading';
  const loadedLoadState = 'loaded';
  const errorLoadState = 'error';
  const [dataLoadState, setDataLoadState] = useState<
    | typeof notStartedLoadState
    | typeof loadingLoadState
    | typeof loadedLoadState
    | typeof errorLoadState
  >(notStartedLoadState);
  const history = useHistory();
  const { trackEvent } = useMatomo();
  const [resultError, setResultError] = useState<
    ApolloError | Error | undefined | DeleteResultLists
  >(undefined);
  const [deleteProfile, { loading: isDeletingProfile }] = useDeleteProfile({
    onCompleted: returnedData => {
      const { failures, successful } = parseDeleteProfileResult(returnedData);
      if (!failures.length) {
        trackEvent({ category: 'action', action: 'Delete profile' });
        history.push('/profile-deleted');
      } else {
        setResultError({ failures, successful });
      }
    },
    onError: error => {
      if (error.graphQLErrors) {
        error.graphQLErrors.forEach(graphQlError => {
          Sentry.captureException(new Error(graphQlError.message));
        });
      } else {
        Sentry.captureException(error);
      }
      setResultError(error);
    },
  });

  const { t, i18n } = useTranslation();

  const [removeButtonId, setFocusToRemoveButton] = useFocusSetter({
    targetId: `delete-profile-button`,
  });

  const [scrollIntoViewRef] = useScrollIntoView(isDeletingProfile);

  const handleConfirmationModal = () => {
    setShowConfirmationModal(prevState => !prevState);
    setFocusToRemoveButton();
  };

  const [getServiceConnections, { data: serviceConnections }] = useLazyQuery<
    ServiceConnectionsRoot,
    ServiceConnectionsQueryVariables
  >(SERVICE_CONNECTIONS, {
    variables: createServiceConnectionsQueryVariables(i18n.language),
    fetchPolicy: 'no-cache',
    onCompleted: () => {
      if (dataLoadState === loadedLoadState) {
        return;
      }
      setDataLoadState(loadedLoadState);
      handleConfirmationModal();
    },
    onError: (error: Error) => {
      setDataLoadState(errorLoadState);
      Sentry.captureException(error);
    },
  });

  const loadServiceConnections = useCallback(
    (reloadAfterError = false) => {
      if (dataLoadState !== loadedLoadState && serviceConnections) {
        setDataLoadState(loadedLoadState);
      } else if (dataLoadState === notStartedLoadState || reloadAfterError) {
        getServiceConnections();
        setDataLoadState(loadingLoadState);
      }
    },
    [getServiceConnections, setDataLoadState, dataLoadState, serviceConnections]
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

    deleteProfile();
  };

  const LoadIndicator = ({ text }: { text: string }) => (
    <Loading
      isLoading
      loadingText={text}
      dataTestId="delete-profile-load-indicator"
      alignLeft
    />
  );
  const ServiceConnectionLoadError = () => (
    <Notification label={t('deleteProfile.deleteFailed')} type={'error'}>
      <StyledButton
        type="button"
        onClick={() => loadServiceConnections(true)}
        data-testid="reload-service-connections"
      >
        {t('notification.tryAgain')}
      </StyledButton>
    </Notification>
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
        {dataLoadState === loadingLoadState ||
        dataLoadState === errorLoadState ? (
          <LoadStateIndicator />
        ) : (
          <StyledButton
            type="button"
            onClick={handleDeleteClick}
            id={removeButtonId}
          >
            {t('deleteProfile.delete')}
          </StyledButton>
        )}
        <ConfirmationModal
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
    </ProfileSection>
  );
}

export default DeleteProfile;
