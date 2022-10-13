import React from 'react';

import { ElementSelector, TestTools } from './testingLibraryTools';

export function createIFrameMockUtil() {
  const mockIFrameTrackerDefaultValues = {
    resolve: true,
    code: 'authCode',
  };

  const mockIFrameTracker = {
    tracker: jest.fn(),
    ...mockIFrameTrackerDefaultValues,
  };

  return {
    trackingData: mockIFrameTracker,
    mockIFrameUrlLoader: (...args: unknown[]) => {
      mockIFrameTracker.tracker(...args);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const func = mockIFrameTracker.resolve ? resolve : reject;
          func({ code: mockIFrameTracker.code }), 100;
        });
      });
    },
    mockCleanUpIFrame: jest.fn(),
    resetTracker: () => {
      Object.assign(mockIFrameTracker, mockIFrameTrackerDefaultValues);
    },
  };
}

export const testIds = {
  loadButton: 'load-button',
  authorizationCodeIndicator: 'authorizationCode-indicator',
  loadStatusIndicator: 'load-status-indicator',
  status: 'status-output',
  removeComponentButton: 'remove-component-button',
};

export function getTestId(key: keyof typeof testIds): ElementSelector {
  return {
    testId: testIds[key],
  };
}

export function getStatus(getElement: TestTools['getElement']) {
  const statusElementContent = getElement(getTestId('status'))?.textContent;
  return statusElementContent ? JSON.parse(statusElementContent) : {};
}

export function OutputComponent(props: {
  data: Record<string, unknown>;
  onClick: () => void;
}) {
  const { data, onClick } = props;
  return (
    <div>
      <button type="button" data-testid={testIds.loadButton} onClick={onClick}>
        Load
      </button>
      <div data-testid={testIds.status}>{JSON.stringify(data)}</div>
    </div>
  );
}
