import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Debounce hook that delays the execution of a function
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef<T>(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

/**
 * Throttle hook that limits the execution frequency of a function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef<T>(callback);
  const lastExecutedRef = useRef<number>(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastExecutedRef.current >= delay) {
        lastExecutedRef.current = now;
        callbackRef.current(...args);
      }
    }) as T,
    [delay]
  );
}

/**
 * Memoized callback hook with dependency optimization
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList = []
): T {
  return useCallback(callback, deps);
}

/**
 * Memoized value hook with deep comparison for objects
 */
export function useDeepMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ deps: React.DependencyList; value: T } | null>(null);

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory()
    };
  }

  return ref.current.value;
}

/**
 * Deep equality comparison for dependency arrays
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a instanceof Array && b instanceof Array) {
    return a.length === b.length && a.every((val, i) => deepEqual(val, b[i]));
  }
  
  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => deepEqual(a[key], b[key]));
  }
  
  return false;
}

/**
 * Previous value hook to detect changes
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

/**
 * Stable reference hook that maintains object identity
 */
export function useStableReference<T extends Record<string, any>>(obj: T): T {
  const ref = useRef<T | null>(null);
  
  if (!ref.current || !shallowEqual(ref.current, obj)) {
    ref.current = obj;
  }
  
  return ref.current;
}

/**
 * Shallow equality comparison
 */
function shallowEqual(objA: any, objB: any): boolean {
  if (Object.is(objA, objB)) return true;
  
  if (typeof objA !== 'object' || objA === null || 
      typeof objB !== 'object' || objB === null) {
    return false;
  }
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => Object.is(objA[key], objB[key]));
}

/**
 * Hook to track component renders (useful for debugging)
 */
export function useRenderCount(componentName: string): number {
  const renderCountRef = useRef(0);
  
  renderCountRef.current += 1;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${componentName} rendered ${renderCountRef.current} times`);
  }
  
  return renderCountRef.current;
}

/**
 * Hook for efficient array memoization
 */
export function useArrayMemo<T>(
  array: T[],
  keyExtractor?: (item: T) => string | number
): T[] {
  return useMemo(() => {
    if (!keyExtractor) return array;
    
    // Create a stable array based on item keys
    const keys = array.map(keyExtractor).join(',');
    return array;
  }, [array, keyExtractor]);
}

/**
 * Hook for batched state updates
 */
export function useBatchedUpdates() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updatesRef = useRef<(() => void)[]>([]);

  const batchUpdate = useCallback((update: () => void) => {
    updatesRef.current.push(update);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const updates = updatesRef.current;
      updatesRef.current = [];
      
      // Execute all batched updates
      updates.forEach(update => update());
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
}