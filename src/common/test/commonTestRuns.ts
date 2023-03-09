import fetchMock, { FetchMock } from 'jest-fetch-mock';
import { TFunction } from 'react-i18next';

import { UpdateMyProfileVariables } from '../../graphql/generatedTypes';
import { ProfileData } from '../../graphql/typings';
import { EditDataType, EditDataValue } from '../../profile/helpers/editData';
import { MockedResponse } from './MockApolloClientProvider';
import {
  ElementSelector,
  submitButtonSelector,
  TestTools,
  waitForElementAttributeValue,
  waitForElementFocus,
} from './testingLibraryTools';

export type DataSource = Partial<EditDataValue | ProfileData>;

type Selectors = {
  editButton: ElementSelector;
  addButton: ElementSelector;
  submitButton: ElementSelector;
  notification: ElementSelector;
  saveIndicator: ElementSelector;
  cancelButton: ElementSelector;
  errorList: ElementSelector;
  removeButton: ElementSelector;
  confirmRemovalButton: ElementSelector;
  noDataText: ElementSelector;
};

type NotificationMessages = {
  success: string;
  error: string;
  saving: string;
  removeError: string;
  removeSuccess: string;
};

type SubmitOptions = {
  checkSaving?: boolean;
  checkSaveSuccess?: boolean;
  checkSaveError?: boolean;
};

export type ValidationTest = {
  prop: string;
  value: string;
  inputSelector: ElementSelector;
  errorSelector: ElementSelector;
};

export type CommonTestSuite = {
  valueVerifier?: (
    testTools: TestTools,
    source: DataSource,
    targetIsInput?: boolean
  ) => Promise<void>;
  valueSetter?: (testTools: TestTools, source: DataSource) => Promise<void>;
  responses?: MockedResponse[];
  notificationMessages?: NotificationMessages;
  sentDataPicker?: (variables: UpdateMyProfileVariables) => DataSource;
  selectors: Selectors;
};

export type TestSuite = CommonTestSuite & {
  testTools: TestTools;
  formData?: DataSource;
  resultingProfile?: Partial<ProfileData>;
  submitProps?: Parameters<TestTools['submit']>[0];
  assumedResponse?: ProfileData;
  initialValues?: EditDataValue;
};

export function getElementSelectors(dataType: EditDataType): Selectors {
  const wasMultiItem = dataType === 'phones' || dataType === 'addresses';
  const prefix = dataType;
  const index = wasMultiItem ? `-0` : ``;
  return {
    editButton: { id: `${prefix}${index}-edit-button` },
    addButton: { id: `${prefix}-add-button` },
    removeButton: { id: `${prefix}${index}-remove-button` },
    confirmRemovalButton: {
      testId: 'confirmation-modal-confirm-button',
    },
    noDataText: {
      testId: `${prefix}-no-data`,
    },
    cancelButton: {
      testId: `${prefix}${index}-cancel-button`,
    },
    notification: {
      id: `${prefix}-edit-notifications`,
    },
    submitButton: submitButtonSelector,
    saveIndicator: { testId: `${prefix}${index}-save-indicator` },
    errorList: { testId: `${prefix}-error-list` },
  };
}

export function getNotificationMessages(
  t: TFunction
): TestSuite['notificationMessages'] {
  return {
    error: t('notification.saveError'),
    success: t('notification.saveSuccess'),
    saving: t('notification.saving'),
    removeError: t('notification.removeError'),
    removeSuccess: t('notification.removeSuccess'),
  };
}

async function clickElementBySelector({
  testTools,
  selector,
}: {
  testTools: TestTools;
  selector: ElementSelector;
}) {
  const { clickElement } = testTools;
  await clickElement(selector);
}

async function clickAddButton({ testTools, selectors }: TestSuite) {
  await clickElementBySelector({ testTools, selector: selectors.addButton });
}

async function clickEditButton({ testTools, selectors }: TestSuite) {
  await clickElementBySelector({ testTools, selector: selectors.editButton });
}

async function clickCancelButton({ testTools, selectors }: TestSuite) {
  await clickElementBySelector({ testTools, selector: selectors.cancelButton });
}

async function clickSubmitButton({ testTools, selectors }: TestSuite) {
  await clickElementBySelector({ testTools, selector: selectors.submitButton });
}
async function clickRemoveButton({ testTools, selectors }: TestSuite) {
  await clickElementBySelector({ testTools, selector: selectors.removeButton });
}

function checkElement({
  testTools,
  selector,
  shouldBeFound,
}: {
  testTools: TestTools;
  selector: ElementSelector;
  shouldBeFound: boolean;
}) {
  const { getElement } = testTools;
  const func = () => getElement(selector);
  if (shouldBeFound) {
    expect(func).not.toThrow();
  } else {
    expect(func).toThrow();
  }
}

export function checkAddButton(
  { testTools, selectors }: TestSuite,
  shouldBeFound: boolean
) {
  return checkElement({
    testTools,
    selector: selectors.addButton,
    shouldBeFound,
  });
}

function checkNoDataText(
  { testTools, selectors }: TestSuite,
  shouldBeFound: boolean
) {
  return checkElement({
    testTools,
    selector: selectors.noDataText,
    shouldBeFound,
  });
}

async function verifyFocusedElement({
  testTools,
  selector,
}: {
  testTools: TestTools;
  selector: ElementSelector;
}) {
  const { getElement } = testTools;
  await waitForElementFocus(() => getElement(selector));
}

async function verifyEditButtonHasFocus({ testTools, selectors }: TestSuite) {
  await verifyFocusedElement({ testTools, selector: selectors.editButton });
}

async function verifyAddButtonHasFocus({ testTools, selectors }: TestSuite) {
  await verifyFocusedElement({ testTools, selector: selectors.addButton });
}

async function waitForInvalidElement(
  { testTools, selectors }: TestSuite,
  test: ValidationTest,
  testForErrors: boolean
) {
  const { errorSelector, inputSelector } = test;
  const { getElement } = testTools;
  const elementGetter = () => getElement(inputSelector);
  const errorElementGetter = () => getElement(errorSelector);
  const errorListElementGetter = () => getElement(selectors.errorList);

  await waitForElementAttributeValue(
    elementGetter,
    'aria-invalid',
    testForErrors
  );
  // getElement throws if element is not found
  if (testForErrors) {
    expect(errorElementGetter).not.toThrow();
    expect(errorListElementGetter).not.toThrow();
  } else {
    expect(errorElementGetter).toThrow();
    expect(errorListElementGetter).toThrow();
  }
}

async function submitForm(
  { testTools, selectors, submitProps, notificationMessages }: TestSuite,
  options: SubmitOptions
) {
  const { submit } = testTools;
  const props = { ...submitProps };
  if (options.checkSaving && !submitProps?.waitForOnSaveNotification) {
    props.waitForOnSaveNotification = {
      selector: selectors.saveIndicator,
      value: String(notificationMessages?.saving),
    };
  }
  if (
    (options.checkSaveSuccess || options.checkSaveError) &&
    !submitProps?.waitForAfterSaveNotification
  ) {
    props.waitForAfterSaveNotification = {
      selector: selectors.notification,
      value: String(
        options.checkSaveSuccess
          ? notificationMessages?.success
          : notificationMessages?.error
      ),
    };
  }
  if (options.checkSaveError) {
    props.skipDataCheck = true;
  }
  return submit(props);
}

async function submitWithoutDefaultChecks(
  suite: TestSuite,
  options: SubmitOptions
) {
  const { testTools, notificationMessages, selectors } = suite;
  const { waitForElementAndValue } = testTools;
  await clickSubmitButton(suite);
  if (options.checkSaving) {
    await waitForElementAndValue({
      selector: selectors.saveIndicator,
      value: String(notificationMessages?.saving),
    });
  }
  if (options.checkSaveSuccess || options.checkSaveError) {
    await waitForElementAndValue({
      selector: selectors.notification,
      value: String(
        options.checkSaveSuccess
          ? notificationMessages?.success
          : notificationMessages?.error
      ),
    });
  }
}

async function verifyValues(
  { testTools, valueVerifier, formData }: TestSuite,
  targetIsInput: boolean,
  values?: DataSource
) {
  if (!valueVerifier) {
    throw new Error('valueVerifier not found');
  }
  await valueVerifier(
    testTools,
    values || (formData as DataSource),
    targetIsInput
  );
}

async function verifyValuesAreReset(tools: TestSuite) {
  const { initialValues } = tools;
  if (!initialValues) {
    throw new Error('initialValues not found');
  }
  return verifyValues(tools, false, initialValues);
}

async function confirmRemoval(tools: TestSuite) {
  const { testTools, selectors } = tools;
  const { waitForElement, clickElement } = testTools;
  await waitForElement(selectors.confirmRemovalButton);
  await clickElement(selectors.confirmRemovalButton);
}

async function checkNotification(
  tools: TestSuite,
  messageKey: keyof NotificationMessages
) {
  const { testTools, selectors, notificationMessages } = tools;
  if (!notificationMessages) {
    throw new Error('notificationMessages not found');
  }
  const { waitForElementAndValue } = testTools;
  await waitForElementAndValue({
    selector: selectors.notification,
    value: notificationMessages[messageKey],
  });
}

async function checkRemoveError(tools: TestSuite) {
  return checkNotification(tools, 'removeError');
}
async function checkRemoveSuccess(tools: TestSuite) {
  return checkNotification(tools, 'removeSuccess');
}

async function setValues({ testTools, valueSetter, formData }: TestSuite) {
  if (!valueSetter) {
    throw new Error('valueSetter not found');
  }
  if (!formData) {
    throw new Error('formData not found');
  }
  await valueSetter(testTools, formData);
}

async function updateAndSetInputValue(suite: TestSuite, test: ValidationTest) {
  const { prop, value } = test;
  const { formData } = suite;
  const updatedData = {
    ...formData,
    [prop]: value,
  };
  await setValues({ ...suite, formData: updatedData });
}

function getFetchMockLastCall(
  mockFn: FetchMock
): [string | Request | undefined, RequestInit | undefined] {
  const mockCalls = mockFn.mock.calls;
  return mockCalls[mockCalls.length - 1];
}

async function verifySentData({ formData, sentDataPicker }: TestSuite) {
  if (!sentDataPicker) {
    throw new Error('sentDataPicker not found');
  }
  const lastCall = getFetchMockLastCall(fetchMock);
  const body = lastCall[1]?.body;
  if (!body) {
    throw new Error('Sent data body not found');
  }
  const sentData = JSON.parse(body.toString()) as {
    variables: UpdateMyProfileVariables;
  };
  const pickedSentData = sentDataPicker(sentData.variables);
  expect(pickedSentData).toMatchObject(formData as DataSource);
  return Promise.resolve();
}

async function addResponse({ assumedResponse, responses }: TestSuite) {
  if (!responses) {
    throw new Error('responses not found');
  }
  if (!assumedResponse) {
    throw new Error('assumedResponse not found');
  }
  responses.push({ updatedProfileData: assumedResponse });
  return Promise.resolve();
}

async function addErrorResponse(
  { responses }: TestSuite,
  response?: MockedResponse
) {
  if (!responses) {
    throw new Error('responses not found');
  }

  responses.push(
    response || {
      errorType: 'networkError',
    }
  );
  return Promise.resolve();
}

export async function testDataIsRendered(suite: TestSuite) {
  await verifyValues(suite, false);
  await clickEditButton(suite);
  await verifyValues(suite, true);
}

export async function testAddingItem(suite: TestSuite) {
  await clickAddButton(suite);
  await setValues(suite);
  await verifyValues(suite, true);
  await addResponse(suite);
  await submitForm(suite, { checkSaveSuccess: true, checkSaving: true });
  await verifyValues(suite, false);
  await verifySentData(suite);
  await verifyEditButtonHasFocus(suite);
  checkAddButton(suite, false);
}

export async function testEditingItem(suite: TestSuite) {
  await clickEditButton(suite);
  await setValues(suite);
  await verifyValues(suite, true);
  await addResponse(suite);
  await submitForm(suite, { checkSaveSuccess: true, checkSaving: true });
  await verifyValues(suite, false);
  await verifySentData(suite);
  await verifyEditButtonHasFocus(suite);
}

export async function testEditingItemFailsAndCancelResets(suite: TestSuite) {
  await clickEditButton(suite);
  await setValues(suite);
  await verifyValues(suite, true);
  await addErrorResponse(suite);
  await submitForm(suite, { checkSaveError: true, checkSaving: true });
  // input fields are still rendered
  await verifyValues(suite, true);
  await clickCancelButton(suite);
  // values are reset to previous values
  await verifyValuesAreReset(suite);
}

export async function testInvalidValues(
  suite: TestSuite,
  validationTests: ValidationTest[]
) {
  await clickEditButton(suite);

  // cannot use forEach with async/await
  for (const testRun of validationTests) {
    await updateAndSetInputValue(suite, testRun);
    // submit also validates the form
    await clickSubmitButton(suite);
    await waitForInvalidElement(suite, testRun, true);
    // set valid values
    await setValues(suite);
    await waitForInvalidElement(suite, testRun, false);
  }
}

export async function testDoubleFailing(suite: TestSuite) {
  await clickEditButton(suite);
  await setValues(suite);
  await verifyValues(suite, true);
  await addErrorResponse(suite);
  // submit and wait for saving and error notifications
  await submitForm(suite, { checkSaveError: true, checkSaving: true });
  await addErrorResponse(suite);
  // submit and wait for saving and error notifications
  await submitForm(suite, { checkSaveError: true, checkSaving: true });
  await addResponse(suite);
  // submit and wait for "saving" and 'saveSuccess' notifications
  await submitForm(suite, { checkSaveSuccess: true, checkSaving: true });
  // new values are shown
  await verifyValues(suite, false);
  await verifyEditButtonHasFocus(suite);
}

export async function testUnchangedDataIsNotSent(suite: TestSuite) {
  // initial profile has been fetched
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await clickEditButton(suite);
  await setValues(suite);
  await submitWithoutDefaultChecks(suite, { checkSaveSuccess: true });

  await verifyValues(suite, false);
  await verifyEditButtonHasFocus(suite);
  // no new fetches have been made
  expect(fetchMock).toHaveBeenCalledTimes(1);
}

export async function testRemovingItem(suite: TestSuite) {
  checkNoDataText(suite, false);
  await addErrorResponse(suite);
  await clickRemoveButton(suite);
  await confirmRemoval(suite);
  await checkRemoveError(suite);
  await addResponse(suite);
  await clickRemoveButton(suite);
  await confirmRemoval(suite);
  await checkRemoveSuccess(suite);
  checkAddButton(suite, true);
  checkNoDataText(suite, true);
}

export async function testAddingItemWithCancel(
  suite: TestSuite,
  noDataTextIsHiddenWhenEditing: boolean
) {
  await clickAddButton(suite);
  checkAddButton(suite, false);
  checkNoDataText(suite, !noDataTextIsHiddenWhenEditing);
  await setValues(suite);
  await verifyValues(suite, true);
  await clickCancelButton(suite);
  checkAddButton(suite, true);
  // no new fetches have been made
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await verifyAddButtonHasFocus(suite);
  checkNoDataText(suite, true);
}
