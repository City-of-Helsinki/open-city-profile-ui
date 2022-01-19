import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import config from '../../config';
import { ErrorPageQueryParams } from '../components/errorPage/ErrorPage';
type RedirectFunction = (params: ErrorPageQueryParams) => void;

export function useErrorPageRedirect(): RedirectFunction {
  const history = useHistory();
  return useCallback(
    params => {
      const queryParams = new URLSearchParams(
        params as URLSearchParams
      ).toString();
      history.replace(`${config.errorPagePath}?${queryParams}`);
    },
    [history]
  );
}
