import { useState, useEffect } from 'react';

export default function usePromise(promise, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    promise()
      .then((r) => {
        setData(r);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, isError : !!error };
}
