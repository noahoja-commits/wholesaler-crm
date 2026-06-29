"use client";

import { useState, useEffect } from "react";

/**
 * Debounce a value by `delay` ms.
 * Used to delay search API calls until the user stops typing.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Generic data-fetching hook with loading/error/data state.
 * Replaces the duplicated fetch+useState+useEffect pattern across all pages.
 *
 * @param url - The API endpoint to fetch (or null to skip).
 * @param options - Optional fetch init (method, headers, etc.).
 * @returns { data, loading, error, refetch }
 */
export function useApi<T>(
  url: string | null,
  options?: RequestInit
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = () => setTrigger((n) => n + 1);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url, options)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, trigger]);

  return { data, loading, error, refetch };
}
