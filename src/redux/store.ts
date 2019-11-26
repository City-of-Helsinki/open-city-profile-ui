import {
  configureStore,
  getDefaultMiddleware,
  Action,
  ConfigureStoreOptions,
} from 'redux-starter-kit';
import { ThunkAction } from 'redux-thunk';

import rootReducer, { RootState } from './rootReducer';

const isProd = process.env.NODE_ENV === 'production';

export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;

export function configureAppStore(options: Partial<ConfigureStoreOptions>) {
  const store = configureStore({
    reducer: rootReducer,
    ...options,
  });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  if (!isProd && (module as any).hot) {
    (module as any).hot.accept('./rootReducer', () => {
      store.replaceReducer(rootReducer);
    });
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return store;
}

const store = configureAppStore({
  devTools: !isProd,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export default store;
