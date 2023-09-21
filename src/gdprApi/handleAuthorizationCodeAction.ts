import { ActionQueue } from '../common/actionQueue/useActionQueue';
import { Action } from '../common/actionQueue/actionQueue';

function loadScopes(queue: ActionQueue) {
  return new Promise(resolve => {
    setTimeout(resolve, 1000);
  });
}

export function handleAuthorizationCodeAction(
  data: Action,
  queue: ActionQueue
): Promise<unknown> | undefined {
  switch (data.type) {
    case 'loadScopes': {
      return loadScopes(queue);
    }
    default: {
      return undefined;
    }
  }
}
