import { User } from 'oidc-client';

import userManager from './userManager';

export default function(): Promise<User> {
  return new Promise(async (resolve, reject) => {
    const user = await userManager.getUser();
    if (user) {
      resolve(user);
    } else {
      reject();
    }
  });
}
