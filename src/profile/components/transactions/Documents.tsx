import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import Explanation from '../../../common/explanation/Explanation';
import DocumentView from './DocumentView';
import PageLayout from '../../../common/pageLayout/PageLayout';
import { useTransactions } from './useTransactions';

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

function Documents(): React.ReactElement {
  const { t } = useTranslation();
  const { getData, isLoading, getError } = useTransactions();
  console.log('getData', getData());
  if (isLoading()) {
    return <p>Loading...</p>;
  }
  if (getError()) {
    return <p>Lataaminen epäonnistui!</p>;
  }
  const data = getData();
  if (!data || !data.length) {
    return <p>Ei tuloksia.</p>;
  }
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
            {data.map(document => (
              <DocumentView key={document.id} document={document} />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default Documents;
