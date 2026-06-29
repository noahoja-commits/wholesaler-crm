"use client";

import { useState, useMemo, useCallback } from "react";
import { useApi } from "@/lib/hooks";
import { DealForm } from "@/components/DealForm";
import { Plus, MoreHorizontal, MapPin, User, ArrowRight, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { STAGE_COLORS, PIPELINE_STAGES } from "@/lib/constants";
import type { Deal } from "@/types";

function DealCard({ deal, onDelete }: { deal: Deal; onDelete: (id: string) => void }) {
  const stageColor = STAGE_COLORS[deal.currentStage] || "#6b7280";
  return (
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-lg p-3.5 cursor-pointer hover:border-[var(--color-border-light)] hover:shadow-lg transition-all duration-150">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">{deal.dealType.replace("_", " ")}</span>
        <button onClick={(e) => { e.stopPropagation(); onDelete(deal.id); }} className="text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
      <h4 className="font-semibold text-sm mb-2.5 text-[var(--color-text-primary)]">{deal.title}</h4>
      {deal.property && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] mb-1">
          <MapPin className="h-3 w-3" /> {deal.property.street}, {deal.property.city}
        </div>
      )}
      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] mb-3">
        <User className="h-3 w-3" /> {deal.seller ? `${deal.seller.firstName} ${deal.seller.lastName}` : "No seller"}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
        <span className="text-sm font-bold text-emerald-400">{formatCurrency(deal.contractPrice || deal.offerPrice)}</span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: stageColor + "20", color: stageColor }}>{deal.currentStage}</span>
      </div>
    </div>
  );
}

function PipelineColumn({ stage, deals, count, onDelete }: { stage: string; deals: Deal[]; count: number; onDelete: (id: string) => void }) {
  const stageColor = STAGE_COLORS[stage] || "#6b7280";
  const pct = count > 0 ? (deals.length / count) * 100 : 0;
  return (
    <div className="flex-shrink-0 w-72 flex flex-col bg-[var(--color-surface-elevated)]/50 rounded-xl border border-[var(--color-border)]">
      <div className="p-3 flex items-center justify-between border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stageColor }} />
          <h3 className="text-sm font-semibold capitalize text-[var(--color-text-primary)]">{stage}</h3>
          <span className="text-xs font-semibold text-[var(--color-text-tertiary)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded-md">{deals.length}</span>
        </div>
        <button className="text-[var(--color-text-tertiary)] hover:text-emerald-400 transition-colors"><Plus className="h-4 w-4" /></button>
      </div>
      <div className="h-1 bg-[var(--color-surface-elevated)]">
        <div className="h-full rounded-r-full transition-all duration-500" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${stageColor}, ${stageColor}88)` }} />
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
        {deals.map((deal) => <DealCard key={deal.id} deal={deal} onDelete={onDelete} />)}
        {deals.length === 0 && <div className="text-xs text-[var(--color-text-tertiary)] text-center py-12">Drop deals here <ArrowRight className="h-3 w-3 inline rotate-90" /></div>}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [showForm, setShowForm] = useState(false);
  const { data, loading, refetch } = useApi<{ deals: Deal[]; total: number }>("/api/deals?orgId=org_demo&limit=200");
  const deals = data?.deals || [];
  const totalDeals = deals.length;
  const handleCreated = useCallback(() => refetch(), [refetch]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this deal?")) return;
    await fetch(`/api/deals/${id}`, { method: "DELETE" });
    refetch();
  }

  const stageGroups = useMemo(() => {
    const groups = new Map<string, Deal[]>();
    for (const stage of PIPELINE_STAGES) groups.set(stage, []);
    for (const deal of deals) {
      const group = groups.get(deal.currentStage);
      if (group) group.push(deal);
    }
    return groups;
  }, [deals]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="flex flex-col items-center gap-3"><div className="h-8 w-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" /><span className="text-sm text-[var(--color-text-tertiary)]">Loading pipeline...</span></div></div>;
  }

  return (
    <div className="space-y-4 h-full flex flex-col max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Pipeline</h2>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">{totalDeals} deals across {PIPELINE_STAGES.length} stages</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add Deal</button>
      </div>
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineColumn key={stage} stage={stage} deals={stageGroups.get(stage) || []} count={totalDeals} onDelete={handleDelete} />
        ))}
      </div>
      <DealForm open={showForm} onClose={() => setShowForm(false)} onCreated={handleCreated} />
    </div>
  );
}
