import { EditDataType } from '../../profile/helpers/editData';
import {
  ElementSelector,
  TestTools,
  waitForElementFocus,
} from './testingLibraryTools';

export function getCommonElementSelector(
  dataType: EditDataType,
  type: string,
  index = 0
): ElementSelector {
  const selectors: Record<string, ElementSelector> = {
    editButton: { id: `${dataType}-#index#-edit-button` },
    addButton: { id: `${dataType}-add-button` },
    removeButton: { id: `${dataType}-#index#-remove-button` },
    confirmRemovalButton: {
      testId: 'confirmation-modal-confirm-button',
    },
    noDataText: {
      testId: `${dataType}-no-data`,
    },
    cancelButton: {
      testId: `${dataType}-#index#-cancel-button`,
    },
    editNotifications: {
      id: `${dataType}-edit-notifications`,
    },
  };

  const selector = selectors[type];
  const selectorAttribute = selector.id ? 'id' : 'testId';
  const value = String(selector[selectorAttribute]);
  return { [selectorAttribute]: value.replace('#index#', String(index)) };
}

export async function testAddWithCancel(
  dataType: EditDataType,
  fieldValueSelector: ElementSelector,
  testTools: TestTools
) {
  const {
    clickElement,
    getElement,
    getTextOrInputValue,
    waitForElement,
  } = testTools;
  await clickElement(getCommonElementSelector(dataType, 'addButton'));
  await waitForElement(getCommonElementSelector(dataType, 'cancelButton'));
  await expect(getTextOrInputValue(fieldValueSelector)).resolves.toBe('');
  expect(() =>
    getElement(getCommonElementSelector(dataType, 'removeButton'))
  ).toThrow();
  expect(() =>
    getElement(getCommonElementSelector(dataType, 'addButton'))
  ).toThrow();

  await clickElement(getCommonElementSelector(dataType, 'cancelButton'));

  expect(() =>
    getElement(getCommonElementSelector(dataType, 'addButton'))
  ).not.toThrow();
  expect(() =>
    getElement(getCommonElementSelector(dataType, 'noDataText'))
  ).not.toThrow();
  // focus is set to add button
  await waitForElementFocus(() =>
    getElement(getCommonElementSelector(dataType, 'addButton'))
  );
}
