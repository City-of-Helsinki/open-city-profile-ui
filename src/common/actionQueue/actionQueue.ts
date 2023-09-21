export type ActionType = string;

export type ActionExecutor = (
  action: Action,
  functions: QueueFunctions
) => Promise<unknown>;

export type ActionProps = {
  type: ActionType;
  executor: ActionExecutor;
  options?: ActionOptions;
};
export type ActionOptions = {
  noStorage?: boolean;
  syncronousCompletion?: boolean;
  idleWhenActive?: boolean;
};

export type ActionUpdateProps = {
  updatedAt: number;
  complete: boolean;
  active: boolean;
  result?: unknown;
  errorMessage?: string;
};

export type Action = ActionProps & ActionUpdateProps;

type ActionFilter = (action: Action) => boolean;

export type InitialQueue = ActionProps[];
export type ActionQueue = Action[];
export type QueueFunctions = {
  getNext: () => Action | undefined;
  getActive: () => Action | undefined;
  getFailed: () => Action | undefined;
  getFirstIdle: () => Action | undefined;
  getQueue: () => ActionQueue;
  getResult: (type: ActionType) => unknown;
  getByType: (type: ActionType) => Action | undefined;
  getComplete: (type: ActionType) => Action[];
  clean: () => void;
  reset: () => void;
  updateActionAndQueue: (
    type: ActionType,
    props: Partial<ActionUpdateProps>
  ) => void;
  isValid: () => boolean;
  isComplete: () => boolean;
  canStartFrom: (type: ActionType) => boolean;
};

function restore(
  storedProps: Partial<Action | ActionProps | ActionUpdateProps>,
  props: Partial<ActionProps | ActionUpdateProps>
): Action {
  return {
    ...storedProps,
    ...props,
  } as Action;
}

function invalidate(action: Action): Action {
  action.updatedAt = -1;
  action.executor = () => {
    throw new Error('This queue item is invalidated');
  };
  action.type = '';
  action.complete = false;
  action.active = false;
  action.errorMessage = 'invalidated';
  action.result = undefined;
  action.options = undefined;
  return action;
}

function createAction(props: ActionProps): Action {
  return {
    ...props,
    updatedAt: Date.now(),
    complete: false,
    active: false,
  };
}

function hasOnlyActionProps(action: ActionProps | Action) {
  return typeof Reflect.get(action, 'complete') === 'undefined';
}

export function mergeQueues(
  currentQueue: ActionQueue,
  updateValues: ActionQueue | InitialQueue
) {
  if (!!currentQueue.length && currentQueue.length !== updateValues.length) {
    throw new Error('Queue update does not match current queue length');
  }
  const uniqueTypes = new Set<ActionType>();
  const verifyTypeDoesNotExist = (type: ActionType) => {
    if (uniqueTypes.has(type)) {
      throw new Error(`Action types must be unique. Found ${type}`);
    }
    uniqueTypes.add(type);
  };
  const verifyAndReturnAction = (action: Action) => {
    verifyTypeDoesNotExist(action.type);
    if (hasOnlyActionProps(action)) {
      throw new Error('Given action is a partial');
    }
    return action;
  };
  const isUpdate = currentQueue.length;
  const primaryQueue = isUpdate ? currentQueue : updateValues;
  return primaryQueue.map((item, index) => {
    const newProps = updateValues[index];
    if (!newProps || newProps.type !== item.type) {
      throw new Error(
        `Updated queue types mismatch at index ${index}. Type #${item.type} vs ${newProps?.type}`
      );
    }
    return verifyAndReturnAction(
      isUpdate ? restore(item as Action, newProps) : createAction(item)
    );
  });
}

const activeFilter: ActionFilter = action => action.active;
const idleFilter: ActionFilter = action => {
  if (action.complete) {
    return false;
  }
  const isIdleWhenActive = !!action.options && !!action.options.idleWhenActive;
  return !action.active || isIdleWhenActive;
};
const completeFilter: ActionFilter = action => action.complete;
const errorFilter: ActionFilter = action =>
  action.complete && !!action.errorMessage;
const nextFilter: ActionFilter = action => !completeFilter(action);

export function createQueue(initialQueue: ActionQueue): QueueFunctions {
  let queue: ActionQueue = initialQueue;
  const filterQueue = (f: ActionFilter): Action[] => queue.filter(f);
  const getByType = (type: ActionType) => queue.filter(f => f.type === type)[0];
  const getFirstIdle = () => queue.find(idleFilter);

  return {
    getQueue: () => queue,
    getByType,
    getActive: () => filterQueue(activeFilter)[0],
    getComplete: () => filterQueue(completeFilter),
    getNext: () => filterQueue(nextFilter)[0],
    getFailed: () => filterQueue(errorFilter)[0],
    getResult: (type: ActionType) => {
      const item = getByType(type);
      return item && item.complete ? item.result : undefined;
    },
    clean: () => {
      queue.forEach(item => invalidate(item));
      queue = [];
    },
    updateActionAndQueue: (
      type: ActionType,
      props: Partial<ActionUpdateProps>
    ) => {
      const item = getByType(type);
      if (!item) {
        throw new Error(
          `Unable to update item. Item of type ${type} not found.`
        );
      }
      const newQueue = queue.map(action => {
        if (action.type === type) {
          return restore(item, { ...props, updatedAt: Date.now() });
        } else {
          return { ...action };
        }
      });
      queue.map(invalidate);
      queue = newQueue;
    },
    isValid: () => queue.length > 0,
    reset: () => {
      const resetProps = {
        updatedAt: Date.now(),
        complete: false,
        active: false,
        result: undefined,
        errorMessage: undefined,
      };
      const newQueue = queue.map(item => restore(item, resetProps));
      queue.map(invalidate);
      queue = newQueue;
    },
    isComplete: () => filterQueue(completeFilter).length === queue.length,
    getFirstIdle,
    canStartFrom: (type: ActionType) => {
      const idle = getFirstIdle();
      return !!idle && idle.type === type;
    },
  };
}
