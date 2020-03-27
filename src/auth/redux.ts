import { createSlice } from 'redux-starter-kit';
import { USER_EXPIRED, LOAD_USER_ERROR, USER_SIGNED_OUT } from 'redux-oidc';

import { AppThunk } from '../redux/store';
import { RootState } from '../redux/rootReducer';
import fetchApiToken from './fetchApiToken';
import pickProfileApiToken from './pickProfileApiToken';

export interface AuthState {
  apiTokens: { [key: string]: string };
  error: string | null;
  loading: boolean;
}

const getInitialState = (): AuthState => ({
  apiTokens: {},
  error: null,
  loading: false,
});

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    startFetching: (state, action) => {
      state.loading = true;
    },
    receiveApiToken: (state, action) => {
      state.error = null;
      state.apiTokens = action.payload;
      state.loading = false;
    },
    apiError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.apiTokens = {};
    },
    resetApiError: (state, action) => {
      state.error = null;
    },
  },
  extraReducers: {
    [USER_EXPIRED]: (state, action) => getInitialState(),
    [LOAD_USER_ERROR]: (state, action) => getInitialState(),
    [USER_SIGNED_OUT]: (state, action) => getInitialState(),
  },
});

export const {
  receiveApiToken,
  startFetching,
  apiError,
  resetApiError,
} = authSlice.actions;
export default authSlice.reducer;

export const fetchApiTokenThunk = (
  accessToken: string
): AppThunk => async dispatch => {
  try {
    dispatch(startFetching());
    const token = await fetchApiToken(accessToken);
    return dispatch(receiveApiToken(token));
  } catch (e) {
    return dispatch(apiError(e.toString()));
  }
};

export const profileApiTokenSelector = (state: RootState) =>
  pickProfileApiToken(state.auth.apiTokens);

export const isAuthenticatedSelector = (state: RootState) =>
  Boolean(!state.oidc.isLoadingUser && state.oidc.user);

export const isFetchingApiTokenSelector = (state: RootState) =>
  state.auth.loading;
