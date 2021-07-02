import dompurify from 'dompurify';

type ReturnObject = {
  [x: string]: string | undefined;
};

function queryParamsToObject<T extends ReturnObject>(queryString: string): T {
  const urlParams = new URLSearchParams(queryString);
  const obj: ReturnObject = {};
  urlParams.forEach((value, key) => {
    obj[key] = dompurify.sanitize(value);
  });
  return obj as T;
}

export default queryParamsToObject;
