import { createSlice } from 'redux-starter-kit';
import { USER_EXPIRED } from 'redux-oidc';

import { AppThunk } from '../redux/store';
import { RootState } from '../redux/rootReducer';
import fetchApiToken from './fetchApiToken';

interface AuthState {
  apiTokens: { [key: string]: string };
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  apiTokens: {},
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
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
  },
  extraReducers: {
    [USER_EXPIRED]: (state, action) => {
      console.log('user expired tralalalla');
      state.apiTokens = {};
    },
  },
});

export const { receiveApiToken, startFetching, apiError } = authSlice.actions;
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
  state.auth.apiTokens[process.env.REACT_APP_PROFILE_AUDIENCE as string];

export const isAuthenticatedSelector = (state: RootState) =>
  Boolean(!state.oidc.isLoadingUser && state.oidc.user);

export const isFetchingApiTokenSelector = (state: RootState) =>
  state.auth.loading;
