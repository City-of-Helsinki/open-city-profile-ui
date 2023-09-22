export type ActionType = string;

export type ActionExecutor = (
  action: Action,
  controller: QueueController
) => Promise<JSONStringifyableResult>;

export type ActionOptions = {
  idleWhenActive?: boolean;
};

export type ActionProps = {
  type: ActionType;
  executor: ActionExecutor;
  options?: ActionOptions;
};

export type JSONStringifyableResult =
  | string
  | number
  | boolean
  | null
  | JSONStringifyableResult[]
  | { [key: string]: JSONStringifyableResult };

export type ActionUpdateProps = {
  updatedAt: number;
  complete: boolean;
  active: boolean;
  result?: JSONStringifyableResult;
  errorMessage?: string;
};

export type Action = ActionProps & ActionUpdateProps;
export type InitialQueue = ActionProps[];
export type ActionQueue = Action[];
export type QueueController = {
  getQueue: () => ActionQueue;
  clean: () => void;
  reset: () => void;
  updateActionAndQueue: (
    type: ActionType,
    props: Partial<Exclude<ActionUpdateProps, 'updatedAt'>>
  ) => void;
  getNext: () => Action | undefined;
  getActive: () => Action | undefined;
  getFailed: () => Action | undefined;
  getResult: (type: ActionType) => unknown;
  getByType: (type: ActionType) => Action | undefined;
  getComplete: () => Action[];
};

type ActionFilter = (action: Action) => boolean;

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
    throw new Error('This queue item has been invalidated');
  };
  action.type = '';
  action.complete = false;
  action.active = false;
  action.errorMessage = 'invalidated';
  action.result = undefined;
  return action;
}

function reset(action: Action | ActionProps): Action {
  const resetProps = {
    updatedAt: Date.now(),
    complete: false,
    active: false,
    result: undefined,
    errorMessage: undefined,
  };
  return restore(action, resetProps);
}

function createAction(props: ActionProps): Action {
  return reset(props);
}

function hasOnlyActionProps(action: ActionProps | Action) {
  return typeof Reflect.get(action, 'complete') === 'undefined';
}

function checkTypesAreUniqueAndSet(list: Array<ActionProps | Action>) {
  const uniqueTypes = new Set<ActionType>();
  list.forEach(action => {
    const { type } = action;
    if (!type) {
      throw new Error(`Action must have a type.`);
    }
    if (uniqueTypes.has(type)) {
      throw new Error(`Action types must be unique. Found ${type}.`);
    }
    uniqueTypes.add(type);
  });
}

export function createQueueFromProps(
  props: Array<Action | ActionProps>
): ActionQueue {
  checkTypesAreUniqueAndSet(props);
  return props.map(actionOrProps => {
    if (hasOnlyActionProps(actionOrProps)) {
      return createAction(actionOrProps);
    }
    return actionOrProps as Action;
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

export function createQueueController(
  initialQueue: ActionQueue
): QueueController {
  let queue: ActionQueue = initialQueue;
  const filterQueue = (f: ActionFilter): Action[] => queue.filter(f);
  const getByType = (type: ActionType) => queue.filter(f => f.type === type)[0];
  checkTypesAreUniqueAndSet(initialQueue);
  const getNext = () => queue.find(idleFilter);
  return {
    getQueue: () => queue.map(action => ({ ...action })),
    clean: () => {
      queue.forEach(item => invalidate(item));
      queue = [];
    },
    updateActionAndQueue: (
      type: ActionType,
      props: Partial<Exclude<ActionUpdateProps, 'updatedAt'>>
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
    reset: () => {
      const newQueue = queue.map(item => reset(item));
      queue.map(invalidate);
      queue = newQueue;
    },
    getActive: () => filterQueue(activeFilter)[0],
    getComplete: () => filterQueue(completeFilter),
    getFailed: () => filterQueue(errorFilter)[0],
    getResult: (type: ActionType) => {
      const item = getByType(type);
      return item && item.complete ? item.result : undefined;
    },
    getNext,
    getByType,
  };
}
