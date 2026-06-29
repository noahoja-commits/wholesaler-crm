"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Command, ArrowRight, Users, Building, Briefcase, FileText } from "lucide-react";
import { useDebounce } from "@/lib/hooks";

interface SearchResult {
  id: string;
  type: "contact" | "property" | "deal" | "document";
  title: string;
  subtitle: string;
  url: string;
}

const TYPE_ICONS = {
  contact: Users,
  property: Building,
  deal: Briefcase,
  document: FileText,
};

const TYPE_COLORS = {
  contact: "text-blue-400",
  property: "text-emerald-400",
  deal: "text-purple-400",
  document: "text-yellow-400",
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 200);

  // Reset state when closed
  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setSelectedIndex(0);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search when query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();

    async function search() {
      try {
        const res = await Promise.all([
          fetch(`/api/contacts?orgId=org_demo&search=${encodeURIComponent(debouncedQuery)}&limit=3`, { signal: controller.signal }),
          fetch(`/api/properties?orgId=org_demo&search=${encodeURIComponent(debouncedQuery)}&limit=3`, { signal: controller.signal }),
          fetch(`/api/deals?orgId=org_demo&limit=10`, { signal: controller.signal }),
        ]);

        const [contacts, properties, deals] = await Promise.all(res.map(r => r.json()));

        const searchResults: SearchResult[] = [];

        // Add contacts
        (contacts.contacts || []).forEach((c: { firstName: string; lastName: string; email?: string | null; phone?: string | null; type: string; id: string }) => {
          if (c.firstName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              c.lastName.toLowerCase().includes(debouncedQuery.toLowerCase())) {
            searchResults.push({
              id: c.id,
              type: "contact",
              title: `${c.firstName} ${c.lastName}`,
              subtitle: c.email || c.phone || c.type,
              url: `/contacts`,
            });
          }
        });

        // Add properties
        (properties.properties || []).forEach((p: { street?: string | null; city?: string | null; state?: string | null; id: string }) => {
          if (p.street?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              p.city?.toLowerCase().includes(debouncedQuery.toLowerCase())) {
            searchResults.push({
              id: p.id,
              type: "property",
              title: p.street || "Unknown",
              subtitle: `${p.city}, ${p.state}`,
              url: `/properties`,
            });
          }
        });

        // Add deals
        (deals.deals || []).forEach((d: { title?: string; currentStage: string; id: string }) => {
          if (d.title?.toLowerCase().includes(debouncedQuery.toLowerCase())) {
            searchResults.push({
              id: d.id,
              type: "deal",
              title: d.title,
              subtitle: d.currentStage,
              url: `/pipeline`,
            });
          }
        });

        setResults(searchResults.slice(0, 8));
        setLoading(false);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setResults([]);
          setLoading(false);
        }
      }
    }

    search();
    return () => controller.abort();
  }, [debouncedQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].url);
      handleClose();
    }
  }, [results, selectedIndex, router, handleClose]);

  const showNoResults = useMemo(() => !loading && query.length >= 2 && results.length === 0, [loading, query, results.length]);
  const showResults = useMemo(() => !loading && results.length > 0, [loading, results.length]);
  const showHint = useMemo(() => query.length < 2, [query.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
          <Search className="h-5 w-5 text-[var(--color-text-tertiary)]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search contacts, properties, deals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none"
          />
          <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface-elevated)] px-2 py-1 rounded">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
              Searching...
            </div>
          )}

          {showNoResults && (
            <div className="px-4 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {showResults && (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = TYPE_ICONS[result.type];
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => {
                      router.push(result.url);
                      handleClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      index === selectedIndex ? "bg-[var(--color-surface-hover)]" : "hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <div className={`${TYPE_COLORS[result.type]} bg-current/10 p-2 rounded-lg`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{result.title}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] truncate">{result.subtitle}</p>
                    </div>
                    {index === selectedIndex && (
                      <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                        <span>Go</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {showHint && (
            <div className="px-4 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
              Type at least 2 characters to search
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-xs text-[var(--color-text-tertiary)] flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded">↑↓</span>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded">↵</span>
            Select
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded">esc</span>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}

// Keyboard shortcuts hint component for the UI
export function KeyboardShortcutsHint() {
  const handleClick = useCallback(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  }, []);

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-colors"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Search</span>
      <div className="flex items-center gap-0.5 ml-1">
        <kbd className="px-1 py-0.5 bg-[var(--color-surface-hover)] rounded text-[10px]">⌘</kbd>
        <kbd className="px-1 py-0.5 bg-[var(--color-surface-hover)] rounded text-[10px]">K</kbd>
      </div>
    </button>
  );
}
