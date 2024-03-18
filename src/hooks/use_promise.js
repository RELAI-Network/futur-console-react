import { useState, useEffect } from 'react';

export default function usePromise(promise) {
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
  }, [promise]);

  return { data, loading, error };
}
