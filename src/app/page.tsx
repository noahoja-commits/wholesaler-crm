"use client";

import { useApi } from "@/lib/hooks";
import { TrendingUp, DollarSign, Home, Target, Activity, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
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
    <div className="card p-5 group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">{label}</span>
        <div className="h-8 w-8 rounded-lg bg-[var(--color-surface-hover)] flex items-center justify-center group-hover:bg-[var(--color-accent-glow)] transition-colors">
          <Icon className="h-4 w-4 text-[var(--color-text-tertiary)] group-hover:text-emerald-400 transition-colors" />
        </div>
      </div>
      <div className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">{value}</div>
      <div className="flex items-center gap-2 mt-2">
        {trend !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold", trend >= 0 ? "text-emerald-400" : "text-red-400")}>
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend * 100).toFixed(1)}%
          </span>
        )}
        {sublabel && <span className="text-xs text-[var(--color-text-tertiary)]">{sublabel}</span>}
      </div>
    </div>
  );
}

function PipelineBar({ stages }: { stages: PipelineStats[] }) {
  const total = stages.reduce((sum, s) => sum + s.count, 0);
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4">Pipeline Breakdown</h3>
      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.stageName} className="flex items-center gap-3 group">
            <span className="text-xs text-[var(--color-text-secondary)] w-24 truncate capitalize">{stage.stageName}</span>
            <div className="flex-1 bg-[var(--color-surface-elevated)] rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out group-hover:brightness-110"
                style={{
                  width: total > 0 ? `${(stage.count / total) * 100}%` : "0%",
                  background: `linear-gradient(90deg, ${stage.color}, ${stage.color}88)`,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-[var(--color-text-primary)] w-10 text-right tabular-nums">{stage.count}</span>
            <span className="text-xs text-[var(--color-text-tertiary)] w-20 text-right tabular-nums">{formatCurrency(stage.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, loading } = useApi<DashboardStats>("/api/dashboard?orgId=org_demo");
  const pipelineStats = stats?.pipelineStats || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          <span className="text-sm text-[var(--color-text-tertiary)]">Loading your pipeline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Dashboard</h2>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            Your wholesale pipeline at a glance
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          Live data · Prisma Postgres
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats?.totalLeads?.toString() || "0"} icon={Home} trend={stats?.leadGrowth} sublabel="vs last month" />
        <StatCard label="Active Deals" value={stats?.activeDeals?.toString() || "0"} icon={Target} />
        <StatCard label="Pipeline Value" value={formatCurrency(stats?.pipelineValue || 0)} icon={DollarSign} />
        <StatCard label="Conversion" value={formatPercent(stats?.conversionRate || 0)} icon={TrendingUp} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Closed This Month" value={stats?.closedThisMonth?.toString() || "0"} icon={Activity} sublabel="deals won" />
        <StatCard label="Avg Deal Size" value={formatCurrency(stats?.avgDealSize || 0)} icon={DollarSign} />
        <StatCard label="Contacts" value={stats?.totalLeads?.toString() || "—"} icon={Users} sublabel="sellers & buyers" />
      </div>

      {/* Pipeline Funnel */}
      <PipelineBar stages={pipelineStats} />

      {/* Quick tip */}
      <div className="card p-4 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 border-emerald-400/10">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          <span className="text-emerald-400 font-semibold">Pro tip:</span>{" "}
          Use the Pipeline page to drag deals between stages. Broadcast deals to your buyer list with one click.
        </p>
      </div>
    </div>
  );
}
