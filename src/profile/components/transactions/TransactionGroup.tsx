import classNames from 'classnames';
import {
  AccordionButtonProps,
  IconAngleDown,
  IconAngleUp,
  RoundedTag,
  useAccordion,
  IconAlertCircle,
  IconCalendar,
  Tag,
  IconInfoCircle,
} from 'hds-react';
import React, { useState } from 'react';

import StyledButton from '../../../common/styledButton/StyledButton';
import Content from './Content';
import {
  Transaction,
  TransactionGroup,
  TransactionStatus,
} from './Transactions';
import styles from './Transactions.module.css';

function CalendarIcon(): React.ReactElement {
  return (
    <div
      className={classNames(
        styles['grid-column-calendar'],
        styles['grid-column-calendar-header']
      )}
    >
      <span className={styles['calendar-icon']}>
        <IconCalendar />
      </span>
      <span
        className={classNames(
          styles['indicator-line'],
          styles['indicator-line-with-icon']
        )}
      ></span>
    </div>
  );
}

function StatusTag({
  text,
  rounded,
  type,
}: {
  text: string;
  rounded?: boolean;
  type?: TransactionStatus;
}): React.ReactElement {
  const Component = rounded ? RoundedTag : Tag;
  const Icon = type === 'action-required' ? IconAlertCircle : IconInfoCircle;
  return (
    <Component
      className={classNames(styles['tag'], styles[`tag-type-${type}`])}
    >
      <span className={styles['tag-content']}>
        <Icon />
        <span className={styles['tag-text']}>{text}</span>
      </span>
    </Component>
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
      <StatusTag text={statusToText(status)} type={status}></StatusTag>
    </div>
  );
}

function ContentAsGridRow(transaction: Transaction): React.ReactElement {
  return (
    <>
      <div className={styles['grid-column-line']}>
        <span
          className={classNames(
            styles['indicator-line'],
            styles['indicator-line-content']
          )}
        ></span>
      </div>
      <div className={styles['transaction-content']}>
        <Content transaction={transaction} />
      </div>
    </>
  );
}

function Title({ title, actionRequired }: Transaction): React.ReactElement {
  return (
    <div
      className={classNames(
        styles['grid-column-title'],
        actionRequired ? styles['grid-column-title-with-action-required'] : ''
      )}
    >
      <span>{title}</span>
      {actionRequired && (
        <StatusTag
          rounded
          type="action-required"
          text="Tarvitsee lisätietoja"
        />
      )}
    </div>
  );
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

function ServiceAndDate({
  timestamp,
  serviceName,
}: Transaction): React.ReactElement {
  return (
    <div className={styles['grid-column-service-and-date']}>
      <div className={styles['service']}>{serviceName}</div>
      <div className={styles['date']}>{timestamp}</div>
    </div>
  );
}

function TransAction({
  transaction,
  buttonCallback,
  position,
}: {
  transaction: Transaction;
  buttonCallback?: () => void;
  position: 'first' | 'last' | 'middle';
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
    <div
      className={classNames(
        styles['transaction'],
        styles[`transaction-${isOpen ? 'open' : 'closed'}`],
        styles[`transaction-position-${position}`]
      )}
    >
      <div className={styles['transaction-grid']}>
        <CalendarIcon />
        <ServiceAndDate {...transaction} />
        <Title {...transaction} />
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
        .map((transaction, index, arr) => (
          <TransAction
            key={transaction.uid}
            transaction={transaction}
            buttonCallback={index === 0 ? () => setIsOpen(!isOpen) : undefined}
            position={
              index === 0
                ? 'first'
                : index === arr.length - 1
                ? 'last'
                : 'middle'
            }
          />
        ))}
    </div>
  );
}

export default TransactionGroupComponent;
