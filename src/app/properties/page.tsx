"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Home } from "lucide-react";
import { useApi, useDebounce } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import type { Property } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  NEW_LEAD: "bg-blue-400/10 text-blue-400",
  CONTACTED: "bg-purple-400/10 text-purple-400",
  APPOINTMENT_SCHEDULED: "bg-violet-400/10 text-violet-400",
  APPOINTMENT_DONE: "bg-yellow-400/10 text-yellow-400",
  OFFER_MADE: "bg-orange-400/10 text-orange-400",
  UNDER_CONTRACT: "bg-emerald-400/10 text-emerald-400",
  CLOSED: "bg-green-400/10 text-green-400",
  DEAD_LEAD: "bg-zinc-800 text-zinc-500",
  NURTURE: "bg-cyan-400/10 text-cyan-400",
};

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const url = useMemo(() => {
    const params = new URLSearchParams({ orgId: "default", limit: "100" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    return `/api/properties?${params}`;
  }, [debouncedSearch]);

  const { data, loading } = useApi<{ properties: Property[]; total: number }>(url);
  const properties = data?.properties || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Properties</h2>
          <p className="text-sm text-zinc-500 mt-1">{data?.total ?? properties.length} properties</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors">
          <Plus className="h-4 w-4" /> Add Property
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-zinc-500">Loading properties...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <div key={property.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs text-zinc-500 uppercase">{property.propertyType.replace("_", " ")}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[property.status] || "bg-zinc-800 text-zinc-500"}`}>
                  {property.status.replace("_", " ")}
                </span>
              </div>
              <h3 className="font-medium text-sm mb-1">{property.street}</h3>
              <p className="text-xs text-zinc-500 mb-3">{property.city}, {property.state} {property.zip}</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {property.beds != null && (<div className="text-xs text-zinc-500"><span className="text-zinc-300 font-medium">{property.beds}</span> beds</div>)}
                {property.baths != null && (<div className="text-xs text-zinc-500"><span className="text-zinc-300 font-medium">{property.baths}</span> baths</div>)}
                {property.sqft != null && (<div className="text-xs text-zinc-500"><span className="text-zinc-300 font-medium">{property.sqft.toLocaleString()}</span> sqft</div>)}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div className="text-xs text-zinc-500">ARV: <span className="text-zinc-300 font-medium">{formatCurrency(property.arv)}</span></div>
                <div className="text-xs text-zinc-500">MAO: <span className="text-emerald-400 font-medium">{formatCurrency(property.mao)}</span></div>
              </div>
              {property.foreclosureStatus && property.foreclosureStatus !== "NONE" && (
                <div className="mt-2 pt-2 border-t border-zinc-800">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-400/10 text-red-400">{property.foreclosureStatus.replace("_", " ")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
