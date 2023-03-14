import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import Explanation from '../../../common/explanation/Explanation';
import TransactionGroupComponent from './TransactionGroup';
import data from './data.json';
import PageLayout from '../../../common/pageLayout/PageLayout';

type TransactionProps = {
  groups: TransactionGroup[];
};

export type TransactionStatus =
  | 'in-progress'
  | 'ready'
  | 'waiting'
  | 'action-required'
  | 'propotion';

export type TransactionGroup = {
  transactions: Transaction[];
};

export type Transaction = {
  timestamp: string;
  title: string;
  serviceName: string;
  serviceUrl: string;
  status: TransactionStatus;
  content: string;
  importance: number;
  uid: string;
};

function Transactions(): React.ReactElement {
  const { t } = useTranslation();
  const { groups } = (data as unknown) as TransactionProps;
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
