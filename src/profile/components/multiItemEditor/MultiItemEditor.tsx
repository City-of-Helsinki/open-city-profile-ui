import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconPlusCircle } from 'hds-react';

import MultiItemPhoneRow from '../multiItemPhoneRow/MultiItemPhoneRow';
import MultiItemAddressRow from '../multiItemAddressRow/MultiItemAddressRow';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import { ActionListener } from '../../hooks/useProfileDataEditor';
import { EditData, EditDataType } from '../../helpers/editData';
import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';
import StyledButton from '../../../common/styledButton/StyledButton';
import {
  useEditorTools,
  UseEditorToolsProps,
} from '../../hooks/useEditorTools';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';

type Props = {
  dataType: Extract<EditDataType, 'addresses' | 'phones'>;
};

export type RowItemProps = {
  data?: EditData;
  onAction: ActionListener;
  dataType: Props['dataType'];
  disableEditButtons: boolean;
};

const translationKeys: Record<
  Props['dataType'],
  UseEditorToolsProps['translationKeys']
> = {
  addresses: {
    modalTitle: 'confirmationModal.removeAddress',
  },
  phones: {
    modalTitle: 'confirmationModal.removePhone',
  },
};

function MultiItemEditor({ dataType }: Props): React.ReactElement | null {
  const {
    userIsVerified,
    editDataList,
    addFuncs,
    noticationContent,
    onAction,
    confirmationModalProps,
  } = useEditorTools({ dataType, translationKeys: translationKeys[dataType] });
  const { hideAddButton, isAddButtonDisabled, addButtonId, add } = addFuncs;
  const { t } = useTranslation();

  const isAddressType = dataType === 'addresses';
  const RowComponent = isAddressType ? MultiItemAddressRow : MultiItemPhoneRow;
  const texts = (function() {
    if (!isAddressType) {
      return {
        modalTitle: t('confirmationModal.removePhone'),
        title: t('profileInformation.phone'),
        listAriaLabel: t('profileInformation.ariaListTitlePhones'),
        addNew: t('profileForm.addPhone'),
        noContent: t('profileInformation.noPhone'),
      };
    }
    return {
      modalTitle: t('confirmationModal.removeAddress'),
      title: userIsVerified
        ? t('profileInformation.addressTitleWhenHasVerifiedData')
        : t('profileInformation.address'),
      listAriaLabel: t('profileInformation.ariaListTitleAddresses'),
      addNew: t('profileForm.addAddress'),
      noContent: userIsVerified
        ? t('profileInformation.addressDescriptionNoWeakAddress')
        : t('profileInformation.addressDescriptionNoAddress'),
    };
  })();

  const NoItemsMessage = () => (
    <div
      className={
        isAddressType ? commonFormStyles['section-title-with-explanation'] : ''
      }
    >
      <h3
        className={
          isAddressType
            ? commonFormStyles['section-title']
            : commonFormStyles['label-size']
        }
      >
        {texts.title}
      </h3>
      <p data-testid={`${dataType}-no-data`}>{texts.noContent}</p>
    </div>
  );

  const data =
    editDataList && editDataList.length ? editDataList[0] : undefined;

  const editHandler = useCommonEditHandling({
    dataType,
    onAction,
    disableEditButtons: false,
    data,
  });

  return (
    <>
      {!data && <NoItemsMessage />}
      {data && (
        <div className={commonFormStyles['list']}>
          <RowComponent editHandler={editHandler} />
        </div>
      )}
      <AccessibilityFieldHelpers dataType={dataType} />
      <EditingNotifications
        content={noticationContent.content}
        dataType={dataType}
      />
      {!hideAddButton && (
        <StyledButton
          iconLeft={<IconPlusCircle />}
          onClick={async () => {
            add();
          }}
          variant="secondary"
          disabled={isAddButtonDisabled}
          className={commonFormStyles['responsive-button']}
          id={addButtonId}
        >
          {texts.addNew}
        </StyledButton>
      )}
      <ConfirmationModal {...confirmationModalProps} />
    </>
  );
}

export default MultiItemEditor;
