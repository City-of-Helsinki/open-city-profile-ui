import React, { ReactNode } from 'react';
import { Accordion, AccordionProps } from 'hds-react';

import styles from './UserGuide.module.css';
import { useMobile } from '../profile/hooks/useMobile';
interface UserGuideAccordionProps {
  children: ReactNode;
  heading: string;
  id: string;
}

function UserGuideAccordion({
  children,
  id,
  heading,
}: UserGuideAccordionProps): React.ReactElement {
  const isMobile = useMobile();

  const accordionStyle = {
    maxWidth: '800px',
    borderTop: 0,
    borderBottom: 1,
    border: 'solid 1px #ffffff',
  };

  const theme = {
    '--background-color': '#F2F2F2',
  };

  const accordionProps: AccordionProps = {
    style: accordionStyle,
    size: isMobile ? 's' : 'l',
    card: true,
    language: 'en',
    theme,
  };

  return (
    <Accordion headingLevel={3} id={id} heading={heading} {...accordionProps}>
      {children}
    </Accordion>
  );
}

export default UserGuideAccordion;
