import { createSlice } from 'redux-starter-kit';

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
  initialState: initialState,
  name: 'auth',
  reducers: {
    receiveApiToken: (state, action) => {
      state.apiTokens = action.payload;
    },
  },
});

export const { receiveApiToken } = authSlice.actions;
export default authSlice.reducer;

export const fetchApiTokenThunk = (
  accessToken: string
): AppThunk => async dispatch => {
  const token = await fetchApiToken(accessToken);
  return dispatch(receiveApiToken(token));
};

export const profileApiTokenSelector = (state: RootState) =>
  state.auth.apiTokens[process.env.REACT_APP_PROFILE_AUDIENCE as string];
