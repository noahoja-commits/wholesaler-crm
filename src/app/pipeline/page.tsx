"use client";

import { useMemo } from "react";
import { useApi } from "@/lib/hooks";
import { Plus, MoreHorizontal, MapPin, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Deal } from "@/types";

const STAGE_COLORS: Record<string, string> = {
  lead: "#6b7280", contacted: "#3b82f6", appointment: "#8b5cf6",
  offer: "#eab308", contract: "#f97316", closing: "#22c55e", closed: "#22c55e",
};

const STAGES = ["lead", "contacted", "appointment", "offer", "contract", "closing", "closed"];

function DealCard({ deal }: { deal: Deal }) {
  const stageColor = STAGE_COLORS[deal.currentStage] || "#6b7280";
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 cursor-pointer hover:border-zinc-600 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-400 uppercase">{deal.dealType.replace("_", " ")}</span>
        <button className="text-zinc-600 hover:text-zinc-400"><MoreHorizontal className="h-4 w-4" /></button>
      </div>
      <h4 className="font-medium text-sm mb-2">{deal.title}</h4>
      {deal.property && (
        <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
          <MapPin className="h-3 w-3" /> {deal.property.street}, {deal.property.city}
        </div>
      )}
      <div className="flex items-center gap-1 text-xs text-zinc-500 mb-2">
        <User className="h-3 w-3" /> {deal.seller ? `${deal.seller.firstName} ${deal.seller.lastName}` : "No seller"}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-emerald-400">{formatCurrency(deal.contractPrice || deal.offerPrice)}</span>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: stageColor + "20", color: stageColor }}>{deal.currentStage}</span>
      </div>
    </div>
  );
}

function PipelineColumn({ stage, deals }: { stage: string; deals: Deal[] }) {
  const stageColor = STAGE_COLORS[stage] || "#6b7280";
  return (
    <div className="flex-shrink-0 w-72 flex flex-col bg-zinc-900/50 rounded-lg border border-zinc-800">
      <div className="p-3 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stageColor }} />
          <h3 className="text-sm font-medium capitalize">{stage}</h3>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">{deals.length}</span>
        </div>
        <button className="text-zinc-600 hover:text-zinc-400"><Plus className="h-4 w-4" /></button>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
        {deals.map((deal) => <DealCard key={deal.id} deal={deal} />)}
        {deals.length === 0 && <div className="text-xs text-zinc-600 text-center py-8">No deals in this stage</div>}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const { data, loading } = useApi<{ deals: Deal[]; total: number }>("/api/deals?orgId=default&limit=200");
  const deals = data?.deals || [];

  // Memoize stage grouping — avoid O(n×m) filter on every render
  const stageGroups = useMemo(() => {
    const groups = new Map<string, Deal[]>();
    for (const stage of STAGES) groups.set(stage, []);
    for (const deal of deals) {
      const group = groups.get(deal.currentStage);
      if (group) group.push(deal);
    }
    return groups;
  }, [deals]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-pulse text-zinc-500">Loading pipeline...</div></div>;
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pipeline</h2>
          <p className="text-sm text-zinc-500 mt-1">{deals.length} deals across {STAGES.length} stages</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors">
          <Plus className="h-4 w-4" /> Add Deal
        </button>
      </div>
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <PipelineColumn key={stage} stage={stage} deals={stageGroups.get(stage) || []} />
        ))}
      </div>
    </div>
  );
}
