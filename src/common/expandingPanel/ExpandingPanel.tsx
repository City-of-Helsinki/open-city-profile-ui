import React, { PropsWithChildren, useRef } from 'react';
import {
  Button,
  Card,
  IconAngleDown,
  IconAngleUp,
  useAccordion,
} from 'hds-react';
import { useTranslation } from 'react-i18next';

import styles from './ExpandingPanel.module.css';

type Props = PropsWithChildren<{
  title?: string;
  showInformationText?: boolean;
  initiallyOpen: boolean;
  scrollIntoViewOnMount?: boolean;
}>;

function ExpandingPanel({
  children,
  initiallyOpen,
  showInformationText,
  scrollIntoViewOnMount,
  title,
}: Props): React.ReactElement {
  const container = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const handleContainerRef = (ref: HTMLDivElement) => {
    // If ref is not saved yet we are about in the first render.
    // In that case we can scroll this element into view.
    if (!container.current && scrollIntoViewOnMount && ref) {
      ref.scrollIntoView();
    }

    container.current = ref;
  };

  const { isOpen, buttonProps, contentProps } = useAccordion({
    initiallyOpen,
  });
  const Icon = isOpen ? IconAngleUp : IconAngleDown;
  const buttonText = isOpen
    ? t('expandingPanel.hideInformation')
    : t('expandingPanel.showInformation');
  return (
    <div className={styles['container']} ref={handleContainerRef}>
      <div className={styles['title']}>
        <h2>{title}</h2>
        <div className={styles['right-side-information']}>
          <Button
            title={`${buttonText}: ${title}`}
            variant={'supplementary'}
            iconRight={<Icon aria-hidden />}
            {...buttonProps}
          >
            {showInformationText && (
              <span className={styles['show-information']} aria-hidden>
                {buttonText}
              </span>
            )}
          </Button>
        </div>
      </div>
      <Card aria-label={title} className={styles['card']} {...contentProps}>
        {children}
      </Card>
    </div>
  );
}

export default ExpandingPanel;
