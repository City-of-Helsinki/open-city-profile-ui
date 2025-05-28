import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import config from '../../config';
import { ErrorPageQueryParams } from '../components/errorPage/ErrorPage';

type RedirectFunction = (params: ErrorPageQueryParams) => void;

export function useErrorPageRedirect(): RedirectFunction {
  const navigate = useNavigate();

  return useCallback(
    (params) => {
      const queryParams = new URLSearchParams(params as URLSearchParams).toString();
      navigate(`${config.errorPagePath}?${queryParams}`, { replace: true });
    },
    [navigate],
  );
}
