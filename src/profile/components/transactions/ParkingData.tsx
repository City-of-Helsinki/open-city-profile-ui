import _ from 'lodash';
import React from 'react';
import { IconCamera, IconCopy, IconPaperclip, IconPrinter } from 'hds-react';
import classNames from 'classnames';

import { Transaction } from './Transactions';
import styles from './ParkingData.module.css';
import data from './parkingData.json';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import StyledButton from '../../../common/styledButton/StyledButton';

function Attachments({
  dataSource,
}: {
  dataSource: (path: string) => string;
}): React.ReactElement {
  const arr = (dataSource('attachments') as unknown) as { name: string }[];
  return (
    <div
      className={classNames(
        styles['data-row'],
        styles['attachments'],
        styles['borderless']
      )}
    >
      {arr.map(item => (
        <span className={styles['attachment']} key={item.name}>
          <IconPaperclip />
          {item.name}
        </span>
      ))}
    </div>
  );
}

function Demands({
  dataSource,
}: {
  dataSource: (path: string) => string;
}): React.ReactElement {
  const getTranslation = (key: string) =>
    dataSource(`translations.demand.${key}`);
  return (
    <>
      <h3>{getTranslation('title')}</h3>
      <div className={styles['data-grid']}>
        <LabeledValue
          label={getTranslation('doneAs')}
          value={getTranslation('doneAsDriver')}
        />
        <LabeledValue
          label={getTranslation('name')}
          value={`${dataSource('user.firstName')} ${dataSource(
            'user.lastName'
          )}`}
        />
        <LabeledValue
          label={getTranslation('sso')}
          value={dataSource(
            'user.verifiedPersonalInformation.nationalIdentificationNumber'
          )}
        />
        <LabeledValue
          label={getTranslation('address')}
          value={`${dataSource('address')}`}
        />
        <LabeledValue
          label={getTranslation('postal')}
          value={`${dataSource('zipCode')} ${dataSource('city')}`}
        />
        <LabeledValue
          label={getTranslation('email')}
          value={dataSource('user.primaryEmail.email')}
        />
        <LabeledValue
          label={getTranslation('phone')}
          value={dataSource('phone')}
        />
        <LabeledValue
          label={getTranslation('iban')}
          value={dataSource('IBAN')}
        />
        <LabeledValue
          label={getTranslation('decisionAs')}
          value={getTranslation('sentTo')}
        />
      </div>
      <div className={classNames(styles['data-row'], styles['borderless'])}>
        <h4>{getTranslation('contents')}</h4>
        {dataSource('rectificationContent')}
      </div>
      <div className={classNames(styles['data-row'], styles['borderless'])}>
        <h4>{getTranslation('attachments')}</h4>
        <Attachments dataSource={dataSource} />
      </div>
    </>
  );
}

function Decision({
  dataSource,
}: {
  dataSource: (path: string) => string;
}): React.ReactElement {
  const getTranslation = (key: string) =>
    dataSource(`translations.decision.${key}`);
  const getFineData = (key: string) => dataSource(`parking-fine.${key}`);
  const getVehicleData = (key: string) => getFineData(`vehicle-info.${key}`);
  const getMoveData = (key: string) => dataSource(`moved-car.${key}`);
  return (
    <>
      <h3>{getTranslation('title')}</h3>
      <h4>{getVehicleData('header')}</h4>
      <div className={classNames(styles['data-grid'], styles['borderless'])}>
        <LabeledValue
          label="Ajoneuvon rekisteritunnus"
          value={dataSource('regNumber')}
        />
        <LabeledValue
          label={getVehicleData('type.label')}
          value={getVehicleData('type.placeholder')}
        />
        <LabeledValue
          label={getVehicleData('brand.label')}
          value={getVehicleData('brand.placeholder')}
        />
        <LabeledValue
          label={getVehicleData('model.label')}
          value={getVehicleData('model.placeholder')}
        />
        <LabeledValue
          label={getVehicleData('color.label')}
          value={getVehicleData('color.placeholder')}
        />
      </div>
      <div className={styles['data-row']}>
        <div className={styles['fake-images']}>
          <span>
            <IconCamera />
          </span>
          <span>
            <IconCamera />
          </span>
          <span>
            <IconCamera />
          </span>
          <span>
            <IconCamera />
          </span>
          <span>
            <IconCamera />
          </span>
        </div>
      </div>
      <div className={styles['data-grid']}>
        <LabeledValue
          label={getMoveData('move-timestamp.label')}
          value={getMoveData('move-timestamp.placeholder')}
        />
        <LabeledValue
          label={getTranslation('uid')}
          value={dataSource('refNumber')}
        />
      </div>
      <div className={styles['data-grid']}>
        <LabeledValue
          label={getMoveData('move-reason.label')}
          value={getMoveData('move-reason.placeholder')}
        />
      </div>
      <div className={styles['data-grid']}>
        <LabeledValue
          label={getMoveData('move-type.label')}
          value={getMoveData('move-type.placeholder')}
        />
      </div>
      <div className={styles['data-grid']}>
        <LabeledValue
          label={getMoveData('address-from.label')}
          labelIcon="location"
          value={getMoveData('address-from.placeholder')}
        />

        <LabeledValue
          label={getMoveData('address-from.details-label')}
          value={getMoveData('address-from.details-placeholder')}
        />
        <span></span>
        <LabeledValue
          label={getMoveData('address-to.label')}
          labelIcon="location"
          value={getMoveData('address-to.placeholder')}
        />

        <LabeledValue
          label={getMoveData('address-to.details-label')}
          value={getMoveData('address-to.details-placeholder')}
        />
        <span></span>
      </div>
      <div className={classNames(styles['data-grid'], styles['borderless'])}>
        <LabeledValue
          label={getMoveData('reimbursement-sum.label')}
          labelIcon="euro"
          value={getMoveData('reimbursement-sum.placeholder')}
        />
        <LabeledValue
          label={getTranslation('dueDate')}
          labelIcon="calendar"
          value="1.1.2035"
        />
        <div className={styles['full-width-grid-item']}>
          <LabeledValue
            label={getTranslation('barcode')}
            value="430123730001230560012400000000000000000100018714210302"
          />
          <StyledButton variant="secondary" iconLeft={<IconCopy />}>
            {getTranslation('copyBarcode')}
          </StyledButton>
        </div>
      </div>
    </>
  );
}

function ParkingData({ contentType }: Transaction): React.ReactElement {
  const dataSource = (path: string) => _.get(data, path, path);
  return (
    <div className={styles['container']}>
      <Demands dataSource={dataSource} />
      <Decision dataSource={dataSource} />
      <div className={styles['print']}>
        <StyledButton variant="primary" iconLeft={<IconPrinter />}>
          {dataSource('translations.print')}
        </StyledButton>
      </div>
    </div>
  );
}

export default ParkingData;
