import { User, UserManager } from 'oidc-client-ts';

export function createUserLoadTrackerPromise(
  userManager: UserManager
): Promise<User | Error> {
  return new Promise((resolve, reject) => {
    let done = false;
    const loadListener = (user: User) => {
      if (done) {
        return;
      }
      done = true;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      removeListeners();
      resolve(user);
    };
    const unloadListener = () => {
      if (done) {
        return;
      }
      done = true;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      removeListeners();
      reject(new Error('User unloaded'));
    };
    const removeListeners = () => {
      userManager.events.removeUserLoaded(loadListener);
      userManager.events.removeUserUnloaded(unloadListener);
    };
    userManager.events.addUserLoaded(loadListener);
    userManager.events.addUserUnloaded(unloadListener);
  });
}
