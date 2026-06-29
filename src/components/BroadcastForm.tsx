"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { useApi } from "@/lib/hooks";

interface BroadcastFormProps {
  open: boolean;
  onClose: () => void;
}

interface Match {
  buyer: { id: string; firstName: string; lastName: string; email?: string | null };
  score: number;
  reasons: string[];
}

interface BroadcastResult {
  totalBuyers: number;
  eligibleBuyers: number;
  matches: Match[];
}

export function BroadcastForm({ open, onClose }: BroadcastFormProps) {
  const [dealId, setDealId] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BroadcastResult | null>(null);

  const { data: dealsData } = useApi<{ deals: Array<{ id: string; title: string }> }>(
    open ? "/api/deals?orgId=org_demo&limit=100" : null
  );
  const deals = dealsData?.deals || [];

  async function run() {
    if (!dealId) {
      setError("Select a deal to broadcast.");
      return;
    }
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/deals/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to broadcast");
      }
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setRunning(false);
    }
  }

  function handleClose() {
    setResult(null);
    setDealId("");
    setError("");
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Broadcast Deal" description="Match a deal against your cash buyers' criteria." size="lg">
      <div className="space-y-4">
        {error && <div className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</div>}

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Deal *</label>
          <select value={dealId} onChange={(e) => setDealId(e.target.value)} className="input">
            <option value="">Select deal...</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>

        {result && (
          <div className="border-t border-[var(--color-border)] pt-3">
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">
              {result.eligibleBuyers} of {result.totalBuyers} buyers match this deal.
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {result.matches.map((m) => (
                <div key={m.buyer.id} className="flex items-center justify-between bg-[var(--color-surface-elevated)] rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{m.buyer.firstName} {m.buyer.lastName}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{m.reasons.join(" · ")}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">{m.score}</span>
                </div>
              ))}
              {result.matches.length === 0 && (
                <p className="text-sm text-[var(--color-text-tertiary)]">No matching buyers found.</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-ghost">Close</button>
          <button type="button" onClick={run} disabled={running} className="btn-primary">
            {running ? "Matching..." : "Find Buyers"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
