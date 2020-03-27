import { combineReducers } from 'redux-starter-kit';
import { reducer as oidcReducer } from 'redux-oidc';

import authReducer from '../auth/redux';

const rootReducer = combineReducers({
  auth: authReducer,
  oidc: oidcReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
