import { useState, useEffect } from 'react';

/**
 * Debounce hook for values (not functions)
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for values
 */
export function useThrottledValue<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  useEffect(() => {
    const now = Date.now();
    
    if (now - lastUpdated >= delay) {
      setThrottledValue(value);
      setLastUpdated(now);
    } else {
      const timeout = setTimeout(() => {
        setThrottledValue(value);
        setLastUpdated(Date.now());
      }, delay - (now - lastUpdated));

      return () => clearTimeout(timeout);
    }
  }, [value, delay, lastUpdated]);

  return throttledValue;
}