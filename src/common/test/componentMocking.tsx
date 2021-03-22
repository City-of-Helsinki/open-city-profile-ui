import React from 'react';
import { render, RenderResult } from '@testing-library/react';

type ElementSelector = {
  testId?: string;
  text?: string;
};

export type TestTools = RenderResult & {
  getElement: (selector: ElementSelector) => HTMLElement | null;
};

export const renderProfileContextWrapper = async (
  children: React.ReactElement
): Promise<TestTools> => {
  const renderResult = render(<React.Fragment>{children}</React.Fragment>);

  const getElement: TestTools['getElement'] = ({ testId, text }) => {
    if (testId) {
      return renderResult.getByTestId(testId);
    }
    if (text) {
      return renderResult.getByText(text);
    }
    throw new Error('getElement selector not set');
  };

  return Promise.resolve({
    ...renderResult,
    getElement,
  });
};
