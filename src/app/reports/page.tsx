"use client";

import { useApi } from "@/lib/hooks";
import { TrendingUp, DollarSign, Target, BarChart3, Clock } from "lucide-react";

interface DashboardStats {
  totalLeads: number; activeDeals: number; pipelineValue: number;
  closedThisMonth: number; conversionRate: number; avgDealSize: number;
  leadGrowth: number; pipelineStats: Array<{ stageName: string; count: number; value: number; color: string }>;
}

export default function ReportsPage() {
  const { data: stats, loading } = useApi<DashboardStats>("/api/dashboard?orgId=org_demo");
  const pipelineStats = stats?.pipelineStats || [];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Reports</h2><p className="text-sm text-zinc-500 mt-1">Performance analytics and deal metrics</p></div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-pulse text-zinc-500">Loading reports...</div></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[ 
              { label: "Pipeline Value", value: `$${(stats?.pipelineValue || 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-400" },
              { label: "Active Deals", value: stats?.activeDeals?.toString() || "0", icon: Target, color: "text-blue-400" },
              { label: "Conversion Rate", value: `${((stats?.conversionRate || 0) * 100).toFixed(1)}%`, icon: TrendingUp, color: "text-purple-400" },
              { label: "Avg Deal Size", value: `$${(stats?.avgDealSize || 0).toLocaleString()}`, icon: BarChart3, color: "text-orange-400" },
            ].map((metric) => (
              <div key={metric.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2"><span className="text-xs text-zinc-500 uppercase tracking-wider">{metric.label}</span><metric.icon className={`h-4 w-4 ${metric.color}`} /></div>
                <div className="text-2xl font-bold">{metric.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">Pipeline Funnel</h3>
            {pipelineStats.length > 0 ? (
              <div className="space-y-3">
                {pipelineStats.map((stage) => {
                  const maxCount = Math.max(...pipelineStats.map((s) => s.count), 1);
                  const pct = (stage.count / maxCount) * 100;
                  return (
                    <div key={stage.stageName} className="flex items-center gap-4">
                      <span className="text-xs text-zinc-400 w-28 capitalize">{stage.stageName}</span>
                      <div className="flex-1 bg-zinc-800 rounded-full h-6 overflow-hidden">
                        <div className="h-full rounded-full flex items-center justify-end px-2 transition-all" style={{ width: `${pct}%`, backgroundColor: stage.color }}>
                          {pct > 15 && <span className="text-xs font-medium text-white">{stage.count}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500 w-20 text-right">${stage.value.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 text-center py-8">No pipeline data yet. Start adding deals.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="font-medium text-sm text-zinc-300 flex items-center gap-2"><Clock className="h-4 w-4 text-zinc-500" /> Deal Velocity</h3>
              <p className="text-xs text-zinc-600 mt-2">Average days from lead to close, broken down by stage.</p>
              <div className="mt-4 h-32 flex items-center justify-center"><span className="text-3xl font-bold text-zinc-700">—</span></div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="font-medium text-sm text-zinc-300 flex items-center gap-2"><Target className="h-4 w-4 text-zinc-500" /> Lead Source ROI</h3>
              <p className="text-xs text-zinc-600 mt-2">ROI breakdown by lead source: direct mail, cold calls, SMS, PPC, referrals.</p>
              <div className="mt-4 h-32 flex items-center justify-center"><span className="text-3xl font-bold text-zinc-700">—</span></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
