"use client";

import { useState, useEffect, useCallback } from "react";

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
  // Start with loading=false if url is null, otherwise true
  const [loading, setLoading] = useState(url === null ? false : true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = () => setTrigger((n) => n + 1);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

/**
 * Register keyboard shortcuts.
 * @param shortcuts - Array of { key, ctrl?, meta?, shift?, handler }
 */
export function useKeyboardShortcuts(shortcuts: Array<{
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  handler: () => void;
  description?: string;
}>) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? e.ctrlKey : true;
      const metaMatch = shortcut.meta ? e.metaKey : true;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch) {
        e.preventDefault();
        shortcut.handler();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "yesterday")
 */
export function useRelativeTime(date: Date | string | null | undefined): string {
  const [value, setValue] = useState(() => formatRelative(date));

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(formatRelative(date));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date]);

  return value;
}

function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "";

  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return then.toLocaleDateString();
}

/**
 * Local storage hook with SSR support
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const next = value instanceof Function ? value(prev) : value;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(next));
      }
      return next;
    });
  }, [key]);

  return [storedValue, setValue];
}
