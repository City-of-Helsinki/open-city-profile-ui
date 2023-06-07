import { useMemo, useRef, useState } from 'react';
import { AnyObject } from 'yup/lib/types';

export function useDataLoader() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>(
    'idle'
  );
  const dataRef = useRef<AnyObject | Error | undefined>(undefined);
  const url =
    'https://atv-api-hki-kanslia-atv-test.agw.arodevtest.hel.fi/v1/documents/';
  const documentId = '43fc3ee3-6e66-4747-a26d-2d84e725aa3e';
  const apiKey = 'P3uclFgp.P7BgjjcFaNDG5wLV7jTNeYsiTztAc7Zt';
  const load = useMemo(
    () => () => {
      setStatus('loading');
      const headers = new Headers();
      headers.append('X-Api-Key', apiKey);
      fetch(`${url}${documentId}`, {
        method: 'GET',
        headers,
      })
        .then(data => {
          dataRef.current = data as AnyObject;
          setStatus('loaded');
        })
        .catch(error => {
          dataRef.current = error;
          setStatus('error');
        });
    },
    []
  );
  return {
    isLoaded: () => status === 'loaded',
    isLoading: () => status === 'loading',
    getData: () =>
      status === 'loaded' ? (dataRef.current as AnyObject) : null,
    getError: () =>
      status === 'error' ? (dataRef.current as AnyObject) : null,
    load,
  };
}
