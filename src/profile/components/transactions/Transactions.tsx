import classNames from 'classnames';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import Explanation from '../../../common/explanation/Explanation';
import TransactionGroupComponent from './TransactionGroup';
import data from './data.json';
import PageLayout from '../../../common/pageLayout/PageLayout';
import { useTransactions } from './useTransactions';

type TransactionProps = {
  groups: TransactionGroup[];
};

export type TransactionStatus =
  | 'received'
  | 'in-progress'
  | 'ready'
  | 'waiting'
  | 'action-required'
  | 'proposal';

export type TransactionGroup = {
  transactions: Transaction[];
};

export type Transaction = {
  timestamp: string;
  title: string;
  serviceName: string;
  serviceUrl: string;
  status: TransactionStatus;
  actionRequired?: boolean;
  content: string;
  data: unknown;
  contentType: 'parking' | 'parking-with-result' | 'certificate';
  uid: string;
};

function Transactions(): React.ReactElement {
  const { t } = useTranslation();
  const { groups } = (data as unknown) as TransactionProps;
  const { getData } = useTransactions();
  console.log('getData', getData);
  return (
    <PageLayout title={'Asiointi'}>
      <div className={classNames([commonContentStyles['content']])}>
        <div
          className={classNames([commonContentStyles['common-content-area']])}
        >
          <Explanation
            heading={t('Asiointi')}
            text={'Käyttämiesi asiointipalveluiden tilannekuva.'}
            useHeadingHeroStyle
          />
        </div>
        <div
          className={classNames([
            commonContentStyles['content'],
            commonContentStyles['common-content-area-dark-bg'],
            commonContentStyles['common-bottom-padding'],
          ])}
        >
          <div
            className={classNames([commonContentStyles['common-content-area']])}
          >
            {groups.map(group => (
              <TransactionGroupComponent
                key={group.transactions[0].uid}
                group={group}
              />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default Transactions;
