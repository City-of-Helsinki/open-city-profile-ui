import classNames from 'classnames';
import {
  AccordionButtonProps,
  IconAngleDown,
  IconAngleUp,
  RoundedTag,
  useAccordion,
  IconAlertCircle,
} from 'hds-react';
import React, { useState } from 'react';

import { Link } from '../../../common/copyOfHDSLink/Link';
import StyledButton from '../../../common/styledButton/StyledButton';
import { Transaction, TransactionGroup } from './Transactions';
import styles from './Transactions.module.css';

function TimeStamp({ timestamp }: Transaction): React.ReactElement {
  return <div className={styles['grid-column-timestamp']}>{timestamp}</div>;
}
function Indicator({ importance }: Transaction): React.ReactElement {
  return (
    <div className={styles['grid-column-indicator']}>
      <span
        className={classNames(
          styles['indicator-dot'],
          importance > 0 ? styles['important-dot'] : styles['unimportant-dot']
        )}
      ></span>
      <span
        className={classNames(
          styles['indicator-line'],
          styles['indicator-line-with-dot']
        )}
      ></span>
    </div>
  );
}

function ServiceLink({
  serviceName,
  serviceUrl,
}: Transaction): React.ReactElement {
  return (
    <div className={styles['grid-column-service']}>
      <Link external openInNewTab href={serviceUrl}>
        {serviceName}
      </Link>
    </div>
  );
}

function StatusText({ status }: Transaction): React.ReactElement {
  const statusToText = (itemStatus: Transaction['status']): string => {
    if (itemStatus === 'in-progress') {
      return 'Käsittelyssä';
    }
    return 'Käsitelty';
  };
  return (
    <div className={styles['grid-column-status']}>
      <RoundedTag>
        <span className={styles['tag-content']}>
          <IconAlertCircle />
          <span className={styles['tag-text']}>{statusToText(status)}</span>
        </span>
      </RoundedTag>
    </div>
  );
}

function Content({ content }: Transaction): React.ReactElement {
  return (
    <div
      className={styles['transaction-content']}
      dangerouslySetInnerHTML={{ __html: content }}
    ></div>
  );
}

function ContentAsGridRow(transaction: Transaction): React.ReactElement {
  return (
    <>
      <div className={styles['grid-column-indicator']}>
        <span className={styles['indicator-line']}></span>
      </div>
      <div></div>
      <Content {...transaction} />
      <div></div>
      <div></div>
    </>
  );
}

function Title({ title }: Transaction): React.ReactElement {
  return <div className={styles['grid-column-title']}>{title}</div>;
}

function AccordionButton(props: {
  title: string;
  testId: string;
  isOpen: boolean;
  buttonProps: AccordionButtonProps;
}): React.ReactElement | null {
  const { isOpen, title, buttonProps, testId } = props;
  const Icon = isOpen ? IconAngleUp : IconAngleDown;
  return (
    <div className={styles['grid-column-button']}>
      <StyledButton
        title={title}
        variant={'transparent'}
        {...buttonProps}
        data-testid={testId}
      >
        <Icon size="m" />
      </StyledButton>
    </div>
  );
}

function TransAction({
  transaction,
  buttonCallback,
}: {
  transaction: Transaction;
  buttonCallback?: () => void;
}): React.ReactElement {
  const { isOpen, buttonProps } = useAccordion({
    initiallyOpen: false,
  });
  const extendedButtonProps: AccordionButtonProps = buttonCallback
    ? {
        ...buttonProps,
        onClick: () => {
          buttonCallback();
          buttonProps.onClick();
        },
      }
    : buttonProps;
  return (
    <div className={styles['transaction']}>
      <div className={styles['transaction-grid']}>
        <Indicator {...transaction} />
        <TimeStamp {...transaction} />
        <Title {...transaction} />
        <ServiceLink {...transaction} />
        <StatusText {...transaction} />
        <AccordionButton
          title="click"
          buttonProps={extendedButtonProps}
          isOpen={isOpen}
          testId="testid"
        />
        {isOpen && <ContentAsGridRow {...transaction} />}
      </div>
    </div>
  );
}

function TransactionGroupComponent({
  group,
}: {
  group: TransactionGroup;
}): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles['group-container']}>
      {group.transactions
        .filter((transaction, index) => isOpen || index === 0)
        .map((transaction, index) => (
          <TransAction
            key={transaction.uid}
            transaction={transaction}
            buttonCallback={index === 0 ? () => setIsOpen(!isOpen) : undefined}
          />
        ))}
    </div>
  );
}

export default TransactionGroupComponent;
