"use client";

import { useApi } from "@/lib/hooks";
import { TrendingUp, DollarSign, Home, Target, Activity, Users } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { DashboardStats, PipelineStats } from "@/types";

function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</span>
        <Icon className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend * 100).toFixed(1)}%
          </span>
        )}
        {sublabel && <span className="text-xs text-zinc-500">{sublabel}</span>}
      </div>
    </div>
  );
}

function PipelineBar({ stages }: { stages: PipelineStats[] }) {
  const total = stages.reduce((sum, s) => sum + s.count, 0);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-zinc-400 mb-3">Pipeline Breakdown</h3>
      <div className="space-y-2">
        {stages.map((stage) => (
          <div key={stage.stageName} className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 w-24 truncate">{stage.stageName}</span>
            <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: total > 0 ? `${(stage.count / total) * 100}%` : "0%",
                  backgroundColor: stage.color,
                }}
              />
            </div>
            <span className="text-xs text-zinc-500 w-12 text-right">{stage.count}</span>
            <span className="text-xs text-zinc-600 w-20 text-right">{formatCurrency(stage.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, loading } = useApi<DashboardStats>("/api/dashboard?orgId=default");
  const pipelineStats = stats?.pipelineStats || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-zinc-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-zinc-500 mt-1">Your wholesale pipeline at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats?.totalLeads?.toString() || "0"} icon={Home} trend={stats?.leadGrowth} sublabel="vs last month" />
        <StatCard label="Active Deals" value={stats?.activeDeals?.toString() || "0"} icon={Target} />
        <StatCard label="Pipeline Value" value={formatCurrency(stats?.pipelineValue || 0)} icon={DollarSign} />
        <StatCard label="Conversion Rate" value={formatPercent(stats?.conversionRate || 0)} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Closed This Month" value={stats?.closedThisMonth?.toString() || "0"} icon={Activity} sublabel="deals won" />
        <StatCard label="Avg Deal Size" value={formatCurrency(stats?.avgDealSize || 0)} icon={DollarSign} />
        <StatCard label="Total Contacts" value="—" icon={Users} sublabel="connect DB to see" />
      </div>

      <PipelineBar stages={pipelineStats} />
    </div>
  );
}
