/* eslint-disable */

import { useRef, useEffect } from 'react';

export const delay = (milliseconds) => new Promise((r) => setTimeout(r, milliseconds));

export const delayed = async (milliseconds, callback) => {
  await delay(milliseconds);
  callback();
};

export function useInterval(callback, delayInSeconds) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delayInSeconds !== null) {
      const id = setInterval(tick, delayInSeconds);
      return () => clearInterval(id);
    }
  }, [delayInSeconds]);
}
