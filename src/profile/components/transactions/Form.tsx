import _ from 'lodash';
import React from 'react';
import { IconCamera, IconCopy, IconPaperclip, IconPrinter } from 'hds-react';
import classNames from 'classnames';

import { Transaction } from './Transactions';
import styles from './ParkingData.module.css';
import data from './document.json';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import StyledButton from '../../../common/styledButton/StyledButton';

function Form({ contentType }: Transaction): React.ReactElement {
  const dataSource = (path: string) => _.get(data, path, path);
  const getTranslation = (key: string) => dataSource(`translations.${key}`);
  const getUserData = (key: string) =>
    dataSource(`content.profile_fields.${key}`);
  const columnsStyle = styles['data-columns'];
  const columnTitleStyle = styles['data-column-title'];
  const columnDataStyle = styles['data-column-data'];
  return (
    <div className={styles['container']}>
      <h3>{dataSource('human_readable_type.fi')}</h3>
      <div className={columnsStyle}>
        <div className={columnTitleStyle}>
          <h4>{getTranslation('formInfoTitle')}</h4>
        </div>
        <div className={columnDataStyle}>{getTranslation('formInfoValue')}</div>
      </div>
      <div className={columnsStyle}>
        <div className={columnTitleStyle}>
          <h4>{getTranslation('ordererTitle')}</h4>
        </div>
        <div className={columnDataStyle}>
          <LabeledValue
            label={getTranslation('firstName')}
            value={getUserData('verifiedFirstName')}
          />
          <LabeledValue
            label={getTranslation('lastName')}
            value={getUserData('verifiedLastName')}
          />
          <LabeledValue
            label={getTranslation('sso')}
            value={getUserData('verifiedSsn')}
          />
          <LabeledValue
            label={getTranslation('phone')}
            value={getUserData('primaryPhone')}
          />
          <LabeledValue
            label={getTranslation('email')}
            value={getUserData('primaryEmail')}
          />
        </div>
      </div>
      <div className={columnsStyle}>
        <div className={columnTitleStyle}>
          <h4>{getTranslation('itemTitle')}</h4>
        </div>
        <div className={columnDataStyle}>
          <LabeledValue
            label={getTranslation('item')}
            value={getTranslation('schoolEndCertificate')}
          />
          <LabeledValue
            label={getTranslation('school')}
            value={getUserData('hkiSchool')}
          />
          <LabeledValue
            label={getTranslation('recipient')}
            value={getTranslation('recipientName')}
          />
        </div>
      </div>
      <div className={columnsStyle}>
        <div className={columnTitleStyle}>
          <h4>{getTranslation('deliveryTitle')}</h4>
        </div>
        <div className={columnDataStyle}>
          <LabeledValue
            label={getTranslation('deliveryType')}
            value={dataSource('content.valitse_toimitustapa.cod')}
          />
          <LabeledValue
            label={getTranslation('address')}
            value={getUserData('verifiedPermanentAddress')}
          />
          <LabeledValue
            label={getTranslation('address')}
            value={getTranslation('schoolAddress')}
          />
          <LabeledValue
            label={getTranslation('postal')}
            value={`${dataSource(
              'content.valitse_toimitustapa.cod_zip_code'
            )} ${dataSource('content.valitse_toimitustapa.cod_city')}`}
          />
        </div>
      </div>

      <div className={styles['print']}>
        <StyledButton variant="primary" iconLeft={<IconPrinter />}>
          {dataSource('translations.print')}
        </StyledButton>
      </div>
    </div>
  );
}

export default Form;
