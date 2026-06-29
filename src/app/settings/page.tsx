"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/hooks";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";

interface StageData {
  id?: string;
  name: string;
  order: number;
  color: string;
}

interface SettingsData {
  organization: { id: string; name: string } | null;
  pipeline: { id: string; name: string; stages: StageData[] } | null;
}

export default function SettingsPage() {
  const { data, loading, refetch } = useApi<SettingsData>("/api/settings?orgId=org_demo");
  const [orgName, setOrgName] = useState("");
  const [stages, setStages] = useState<StageData[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.organization) setOrgName(data.organization.name);
    if (data?.pipeline?.stages) setStages(data.pipeline.stages);
  }, [data]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: "org_demo",
          organizationName: orgName,
          pipelineId: data?.pipeline?.id,
          stages: stages.map((s, i) => ({ name: s.name, order: i, color: s.color })),
        }),
      });
      setSaved(true);
      refetch();
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function addStage() {
    const colors = ["#6b7280", "#3b82f6", "#8b5cf6", "#eab308", "#f97316", "#22c55e", "#ef4444"];
    setStages([...stages, { name: "new-stage", order: stages.length, color: colors[stages.length % colors.length] }]);
  }

  function removeStage(index: number) {
    setStages(stages.filter((_, i) => i !== index));
  }

  function moveStage(index: number, direction: -1 | 1) {
    const newStages = [...stages];
    const target = index + direction;
    if (target < 0 || target >= newStages.length) return;
    [newStages[index], newStages[target]] = [newStages[target], newStages[index]];
    setStages(newStages);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="flex flex-col items-center gap-3"><div className="h-8 w-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" /><span className="text-sm text-[var(--color-text-tertiary)]">Loading settings...</span></div></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Settings</h2>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">Customize your organization and pipeline</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Organization */}
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">Organization</h3>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Organization Name</label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="input"
            placeholder="Your company name"
          />
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">This appears in the sidebar footer.</p>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">Pipeline Stages</h3>
          <button onClick={addStage} className="btn-ghost text-xs"><Plus className="h-3.5 w-3.5" /> Add Stage</button>
        </div>

        <div className="space-y-2">
          {stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border)]">
              <div className="flex items-center gap-1">
                <button onClick={() => moveStage(i, -1)} disabled={i === 0} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 transition-colors">
                  <GripVertical className="h-4 w-4" />
                </button>
              </div>
              <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
              <input
                type="text"
                value={stage.name}
                onChange={(e) => {
                  const newStages = [...stages];
                  newStages[i] = { ...newStages[i], name: e.target.value };
                  setStages(newStages);
                }}
                className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] focus:outline-none"
                placeholder="Stage name"
              />
              <input
                type="color"
                value={stage.color}
                onChange={(e) => {
                  const newStages = [...stages];
                  newStages[i] = { ...newStages[i], color: e.target.value };
                  setStages(newStages);
                }}
                className="h-6 w-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <button onClick={() => removeStage(i)} className="text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-[var(--color-text-tertiary)]">
          Changes to pipeline stages affect how deals are displayed. Existing deals keep their current stage name.
        </p>
      </div>

      {/* Database Info */}
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">Database</h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm text-[var(--color-text-secondary)]">Prisma Postgres</span>
          <span className="text-xs text-[var(--color-text-tertiary)]">· Connected · Production</span>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Manage your schema with <code className="bg-[var(--color-surface-elevated)] px-1.5 py-0.5 rounded text-xs">npx prisma studio</code> or{" "}
          <code className="bg-[var(--color-surface-elevated)] px-1.5 py-0.5 rounded text-xs">npx prisma db push</code>
        </p>
      </div>
    </div>
  );
}
