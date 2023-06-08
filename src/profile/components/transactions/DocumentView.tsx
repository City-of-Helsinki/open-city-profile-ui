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
import { Document, History, StatusType } from './index';
import styles from './Transactions.module.css';
import activityViewStyles from './ActivityView.module.css';
import ActivityView from './ActivityView';

const indicatorLineStyle = styles['indicator-line'];
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
          indicatorLineStyle,
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
  type?: StatusType;
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

function StatusText({ statusType, status }: Document): React.ReactElement {
  const statusToText = (itemStatus: Document['statusType']): string => {
    if (itemStatus === 'in-progress') {
      return 'Käsittelyssä';
    }
    if (itemStatus === 'received') {
      return 'Vastaanotettu';
    }
    if (itemStatus === 'submitted') {
      return 'Lähetetty';
    }
    return 'Käsitelty';
  };
  return (
    <div className={styles['grid-column-status']}>
      <StatusTag text={status} type={statusType}></StatusTag>
    </div>
  );
}

/*
function ContentAsGridRow(document: Document): React.ReactElement {
  return (
    <>
      <div className={styles['grid-column-line']}>
        <span
          className={classNames(
            indicatorLineStyle,
            styles['indicator-line-content']
          )}
        ></span>
      </div>
      <div className={styles['transaction-content']}>
        <Content document={document} />
      </div>
    </>
  );
}



function ActivityView(activity: Activity): React.ReactElement {
  return (
    <>
      <div className={styles['grid-column-line']}>
        <span
          className={classNames(
            indicatorLineStyle,
            styles['indicator-line-content']
          )}
        ></span>
      </div>
      <div className={styles['transaction-content']}>
        <p>{activity.title}</p>
      </div>
    </>
  );
}

function ActivitiesView(history: History): React.ReactElement {
  return (
    <>
      <div className={styles['grid-column-line']}>
        <span
          className={classNames(
            indicatorLineStyle,
            styles['indicator-line-content']
          )}
        ></span>
      </div>
      <div className={styles['transaction-content']}>
        {history.activities.map(data => (
          <ActivityView key={data.created} {...data} />
        ))}
      </div>
    </>
  );
}
*/

function ContentAreaWrapper({
  children,
}: React.PropsWithChildren<unknown>): React.ReactElement {
  return (
    <>
      <div className={styles['grid-column-line']}>
        <span
          className={classNames(
            indicatorLineStyle,
            styles['indicator-line-content']
          )}
        ></span>
      </div>
      <div className={styles['transaction-content']}>{children}</div>
    </>
  );
}
function ActivitiesView(history: History): React.ReactElement {
  return (
    <ContentAreaWrapper>
      <ActivityView {...history} />
    </ContentAreaWrapper>
  );
}

function ContentView(document: Document): React.ReactElement {
  return (
    <ContentAreaWrapper>
      <div className={activityViewStyles['container']}>
        <h3>Sisältö</h3>
        <div className={activityViewStyles['data-columns']}>
          <pre>{JSON.stringify(document.content, null, 2)}</pre>
        </div>
      </div>
    </ContentAreaWrapper>
  );
}
function AttachmentView(document: Document): React.ReactElement {
  return (
    <ContentAreaWrapper>
      <div className={activityViewStyles['container']}>
        <h3>Liitteet</h3>
        <div className={activityViewStyles['data-columns']}>
          <pre>{JSON.stringify(document.attachments, null, 2)}</pre>
        </div>
      </div>
    </ContentAreaWrapper>
  );
}

function ChildItems({
  data,
  document,
}: {
  data: History;
  document: Document;
}): React.ReactElement {
  const hasActivities = !!data.activities.length;
  const hasContent = !!document.content;
  const hasAttachments = !!document.attachments.length;
  return (
    <>
      <div className={styles['grid-column-line']}>
        <span
          className={classNames(
            indicatorLineStyle,
            styles['indicator-line-content']
          )}
        ></span>
      </div>
      <div className={styles['transaction-content']}>
        {hasActivities && <ActivitiesView {...data} />}
        {hasContent && <ContentView {...document} />}
        {hasAttachments && <AttachmentView {...document} />}
      </div>
    </>
  );
}

function Title({ title, actionRequired }: Document): React.ReactElement {
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
  empty: boolean;
  buttonProps: AccordionButtonProps;
}): React.ReactElement | null {
  const { isOpen, title, buttonProps, testId, empty } = props;
  const Icon = isOpen ? IconAngleUp : IconAngleDown;
  if (empty) {
    return <div className={styles['grid-column-button']}></div>;
  }
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

function ServiceAndDate({ created, service }: Document): React.ReactElement {
  return (
    <div className={styles['grid-column-service-and-date']}>
      <div className={styles['service']}>{service}</div>
      <div className={styles['date']}>{created}</div>
    </div>
  );
}

function HistoryItem({
  data,
  document,
  buttonCallback,
  position,
}: {
  data: History;
  document: Document;
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
  const hasChildren =
    !!data.activities.length ||
    !!document.content ||
    !!document.attachments.length;
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
        <ServiceAndDate {...document} />
        <Title {...document} />
        <StatusText {...document} />
        <AccordionButton
          title="click"
          buttonProps={extendedButtonProps}
          isOpen={isOpen}
          testId="testid"
          empty={!hasChildren}
        />
        {isOpen && hasChildren && (
          <ChildItems data={data} document={document} />
        )}
      </div>
    </div>
  );
}

function DocumentView({
  document,
}: {
  document: Document;
}): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles['group-container']}>
      {document.history
        .filter((transaction, index) => isOpen || index === 0)
        .map((data, index, arr) => (
          <HistoryItem
            key={data.created}
            data={data}
            document={document}
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

export default DocumentView;
