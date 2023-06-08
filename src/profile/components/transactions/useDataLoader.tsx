import { useMemo, useRef, useState } from 'react';
import { AnyObject } from 'yup/lib/types';

import { Document, RawResults } from '.';
import { convertResults } from './dataConverter';

export function useDataLoader() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>(
    'idle'
  );
  const dataRef = useRef<Document[] | Error | undefined>(undefined);
  const url =
    'https://atv-api-hki-kanslia-atv-test.agw.arodevtest.hel.fi/v1/documents/';
  //const documentId = '41957115-eafe-4514-9959-89955c27a5e7';
  const apiKey = 'P3uclFgp.P7BgjjcFaNDG5wLV7jTNeYsiTztAc7Zt';
  const load = useMemo(
    () => () => {
      setStatus('loading');
      const headers = new Headers();
      headers.append('X-Api-Key', apiKey);
      fetch(`${url}`, {
        method: 'GET',
        headers,
      })
        .then(async data => {
          try {
            const json = await data.json();
            dataRef.current = convertResults(json as RawResults);
            setStatus('loaded');
          } catch (e) {
            dataRef.current = e as Error;
            setStatus('error');
          }
        })
        .catch(error => {
          dataRef.current = error;
          setStatus('error');
        });
    },
    []
  );
  return {
    isLoaded: () => status === 'loaded' || status === 'error',
    isLoading: () => status === 'loading',
    getData: () =>
      status === 'loaded' ? (dataRef.current as Document[]) : null,
    getError: () => (status === 'error' ? (dataRef.current as Error) : null),
    load,
  };
}
