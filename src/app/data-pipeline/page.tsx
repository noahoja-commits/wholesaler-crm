"use client";

import { useEffect, useState } from "react";
import { Plus, Database, Upload, Link2, Zap } from "lucide-react";

interface DataSource {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  lastRunAt: string | null;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  COUNTY_API: Link2,
  CSV_IMPORT: Upload,
  WEBHOOK: Zap,
  ZAPIER: Zap,
  MANUAL: Database,
};

export default function DataPipelinePage() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data-sources?orgId=org_demo")
      .then((r) => r.json())
      .then((data) => {
        setSources(data.sources || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Pipeline</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Ingest leads from county records, CSV imports, APIs, and webhooks
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors">
          <Plus className="h-4 w-4" />
          Add Source
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CSV Import Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm">CSV Import</h3>
              <p className="text-xs text-zinc-500">Upload property lists</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            Import properties from PropStream, BatchLeads, or county record exports.
            We auto-compute MAO (70% ARV – repairs).
          </p>
          <div className="border-2 border-dashed border-zinc-800 rounded-lg p-8 text-center">
            <Upload className="h-6 w-6 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-500 mb-1">
              Drag & drop a CSV file here
            </p>
            <p className="text-xs text-zinc-600">
              Columns: street, city, state, zip, beds, baths, sqft, arv, repairCost, foreclosureStatus
            </p>
          </div>
        </div>

        {/* County API Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
              <Link2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm">County Records API</h3>
              <p className="text-xs text-zinc-500">Live public record pulls</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            Configure county-level API connections to pull pre-foreclosure, tax
            delinquent, and absentee owner lists automatically.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="County name (e.g., Harris County, TX)"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
            <input
              type="text"
              placeholder="API endpoint URL"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
            <button className="w-full py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-500 transition-colors">
              Connect & Pull Records
            </button>
          </div>
        </div>

        {/* Webhook Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Webhook / Zapier</h3>
              <p className="text-xs text-zinc-500">Real-time lead ingestion</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            Accept leads from Facebook ads, website forms, or any Zapier-connected
            source. Each POST creates a new property lead.
          </p>
          <div className="bg-zinc-950 rounded-md p-3">
            <code className="text-xs text-zinc-400 break-all">
              POST /api/properties/import
            </code>
            <p className="text-xs text-zinc-600 mt-2">
              Accepts JSON array of property objects. Auto-deduplicates by
              street+zip.
            </p>
          </div>
        </div>

        {/* Manual Entry */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
              <Database className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Manual Entry</h3>
              <p className="text-xs text-zinc-500">Add leads one at a time</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            Use the Properties page to manually add leads from driving for
            dollars, cold calls, or referrals.
          </p>
          <a
            href="/properties"
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
          >
            Go to Properties →
          </a>
        </div>
      </div>

      {/* Existing Sources */}
      {!loading && sources.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Configured Sources</h3>
          <div className="space-y-2">
            {sources.map((source) => {
              const Icon = TYPE_ICONS[source.type] || Database;
              return (
                <div
                  key={source.id}
                  className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm">{source.name}</span>
                    <span className="text-xs text-zinc-500">{source.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs ${source.enabled ? "text-emerald-400" : "text-zinc-600"}`}
                    >
                      {source.enabled ? "Enabled" : "Disabled"}
                    </span>
                    {source.lastRunAt && (
                      <span className="text-xs text-zinc-600">
                        Last run: {new Date(source.lastRunAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
