"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, Plus, Home, Trash2 } from "lucide-react";
import { useApi, useDebounce } from "@/lib/hooks";
import { PropertyForm } from "@/components/PropertyForm";
import { formatCurrency } from "@/lib/utils";
import { PROPERTY_STATUS_COLORS } from "@/lib/constants";
import type { Property } from "@/types";

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const url = useMemo(() => {
    const params = new URLSearchParams({ orgId: "org_demo", limit: "100" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    return `/api/properties?${params}`;
  }, [debouncedSearch]);

  const { data, loading, refetch } = useApi<{ properties: Property[]; total: number }>(url);
  const properties = data?.properties || [];
  const handleCreated = useCallback(() => refetch(), [refetch]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this property?")) return;
    await fetch(`/api/properties/${id}`, { method: "DELETE" });
    refetch();
  }

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Properties</h2>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">{data?.total ?? properties.length} properties</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add Property</button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
        <input type="text" placeholder="Search by address..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="flex items-center gap-3 text-[var(--color-text-tertiary)] text-sm"><div className="h-4 w-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" /> Loading properties...</div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <div key={property.id} className="card-accent p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[var(--color-surface-hover)] flex items-center justify-center">
                    <Home className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">{property.propertyType.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`badge text-[10px] ${PROPERTY_STATUS_COLORS[property.status] || "badge-muted"}`}>{property.status.replace("_", " ")}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(property.id); }} className="p-1 rounded-md text-[var(--color-text-tertiary)] hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1 text-[var(--color-text-primary)]">{property.street}</h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-4">{property.city}, {property.state} {property.zip}</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {property.beds != null && (<div className="text-xs text-[var(--color-text-tertiary)]"><span className="text-[var(--color-text-primary)] font-semibold">{property.beds}</span> beds</div>)}
                {property.baths != null && (<div className="text-xs text-[var(--color-text-tertiary)]"><span className="text-[var(--color-text-primary)] font-semibold">{property.baths}</span> baths</div>)}
                {property.sqft != null && (<div className="text-xs text-[var(--color-text-tertiary)]"><span className="text-[var(--color-text-primary)] font-semibold">{property.sqft.toLocaleString()}</span> sqft</div>)}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <div className="text-xs"><span className="text-[var(--color-text-tertiary)]">ARV </span><span className="text-[var(--color-text-primary)] font-semibold">{formatCurrency(property.arv)}</span></div>
                <div className="text-xs"><span className="text-[var(--color-text-tertiary)]">MAO </span><span className="text-emerald-400 font-bold">{formatCurrency(property.mao)}</span></div>
              </div>
              {property.foreclosureStatus && property.foreclosureStatus !== "NONE" && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <span className="badge bg-red-400/10 text-red-400">{property.foreclosureStatus.replace("_", " ")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <PropertyForm open={showForm} onClose={() => setShowForm(false)} onCreated={handleCreated} />
    </div>
  );
}
