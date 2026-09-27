import { useCallback, useEffect, useState } from "react";

/**
 * SSR-safe localStorage-backed state. Starts with `initialValue` on the
 * server and during the first client render (to avoid hydration
 * mismatches), then hydrates from localStorage right after mount.
 */
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage unavailable (private mode, quota, etc.) — ignore
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}
