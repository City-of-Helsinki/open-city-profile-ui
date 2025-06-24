import React, {
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Button,
  Card,
  IconAngleDown,
  IconAngleUp,
  useAccordion,
  ButtonVariant,
} from 'hds-react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './ExpandingPanel.module.css';
import commonStyles from '../cssHelpers/common.module.css';

type Props = PropsWithChildren<{
  title?: string;
  showInformationText?: boolean;
  initiallyOpen: boolean;
  scrollIntoViewOnMount?: boolean;
  onChange?: (isOpen: boolean) => void;
  dataTestId?: string;
}>;

function ExpandingPanel({
  children,
  initiallyOpen,
  showInformationText,
  scrollIntoViewOnMount,
  title,
  dataTestId,
  onChange,
}: Props): React.ReactElement {
  const [beforeCloseButtonClick, setBeforeCloseButtonClick] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { t } = useTranslation();
  const { isOpen, buttonProps, contentProps, openAccordion } = useAccordion({
    initiallyOpen,
  });

  const container = useRef<HTMLDivElement | null>(null);
  const titleButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (initiallyOpen && isOpen !== initiallyOpen) {
      openAccordion();
    }
  }, [initiallyOpen, openAccordion, isOpen]);

  useEffect(() => {
    if (onChange) {
      onChange(isOpen);
    }
  }, [isOpen, onChange]);

  useEffect(() => {
    if (!hasMounted) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (titleButtonRef.current) {
        titleButtonRef.current.focus();
      }

      if (beforeCloseButtonClick === true) {
        setBeforeCloseButtonClick(false);
        buttonProps.onClick();
      }
    }, 50);

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beforeCloseButtonClick]);

  const handleContainerRef = (ref: HTMLDivElement) => {
    // If ref is not saved yet we are about in the first render.
    // In that case we can scroll this element into view.
    if (!container.current && scrollIntoViewOnMount && ref) {
      ref.scrollIntoView();
    }

    container.current = ref;
  };

  const onCloseButtonActivate = () => {
    setBeforeCloseButtonClick(true);
  };

  const Icon = isOpen ? IconAngleUp : IconAngleDown;
  const buttonTestId = dataTestId
    ? { 'data-testid': `${dataTestId}-toggle-button` }
    : null;
  const secondaryButtonTestId = dataTestId
    ? { 'data-testid': `${dataTestId}-secondary-toggle-button` }
    : null;

  return (
    <div
      className={classNames(commonStyles['content-box'], styles['container'])}
      ref={handleContainerRef}
    >
      <div className={styles['title']}>
        <h2>{title}</h2>
        <div className={styles['right-side-information']}>
          <Button
            ref={titleButtonRef}
            title={title}
            variant={ButtonVariant.Supplementary}
            iconEnd={<Icon aria-hidden />}
            {...buttonProps}
            {...buttonTestId}
          >
            {showInformationText
              ? t(
                  isOpen
                    ? 'expandingPanel.hideInformation'
                    : 'expandingPanel.showInformation'
                )
              : ''}
          </Button>
        </div>
      </div>
      <Card aria-label={title} className={styles['card']} {...contentProps}>
        {children}
      </Card>
      {isOpen && (
        <div className={styles['close-button-container']}>
          <Button
            title={title}
            variant={ButtonVariant.Supplementary}
            iconEnd={<Icon aria-hidden />}
            {...buttonProps}
            {...secondaryButtonTestId}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onCloseButtonActivate();
              }
            }}
            onClick={() => {
              onCloseButtonActivate();
            }}
          >
            {t('expandingPanel.closeButtonText')}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ExpandingPanel;
