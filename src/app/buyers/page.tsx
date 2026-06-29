"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Phone, Mail, Radio, ChevronDown, ChevronUp } from "lucide-react";
import { useApi, useDebounce } from "@/lib/hooks";
import type { Contact } from "@/types";

interface BuyerWithPrefs extends Contact {
  buyerPreferences?: Array<{
    id: string; states: string[]; cities: string[]; zipCodes: string[];
    minBeds: number | null; maxBeds: number | null;
    minPrice: number | null; maxPrice: number | null;
    maxArv: number | null; maxRepairCost: number | null;
    propertyTypes: string[]; dealTypes: string[]; notes: string | null;
  }>;
}

export default function BuyersPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, loading } = useApi<{ buyers: BuyerWithPrefs[] }>("/api/buyers?orgId=default");
  const buyers = data?.buyers || [];

  const filtered = useMemo(() => {
    if (!debouncedSearch) return buyers;
    const s = debouncedSearch.toLowerCase();
    return buyers.filter(
      (b) =>
        b.firstName.toLowerCase().includes(s) ||
        b.lastName.toLowerCase().includes(s) ||
        b.email?.toLowerCase().includes(s) ||
        b.city?.toLowerCase().includes(s)
    );
  }, [buyers, debouncedSearch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Buyer List</h2>
          <p className="text-sm text-zinc-500 mt-1">{filtered.length} cash buyers</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-500 transition-colors">
            <Radio className="h-4 w-4" /> Broadcast Deal
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors">
            <Plus className="h-4 w-4" /> Add Buyer
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text" placeholder="Search buyers..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-pulse text-zinc-500">Loading buyers...</div></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((buyer) => {
            const pref = buyer.buyerPreferences?.[0];
            const isExpanded = expandedId === buyer.id;
            return (
              <div key={buyer.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : buyer.id)}>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-400/10 flex items-center justify-center">
                      <span className="text-emerald-400 font-bold text-sm">{buyer.firstName[0]}{buyer.lastName[0]}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{buyer.firstName} {buyer.lastName}</h3>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                        {buyer.phone && (<span className="flex items-center gap-1"><Phone className="h-3 w-3" />{buyer.phone}</span>)}
                        {buyer.email && (<span className="flex items-center gap-1"><Mail className="h-3 w-3" />{buyer.email}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {pref && <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{pref.states.join(", ") || "Any state"}</span>}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                  </div>
                </div>
                {isExpanded && pref && (
                  <div className="px-4 pb-4 border-t border-zinc-800 pt-3 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div><span className="text-xs text-zinc-500">States</span><p className="text-sm">{pref.states.join(", ") || "Any"}</p></div>
                      <div><span className="text-xs text-zinc-500">Cities</span><p className="text-sm">{pref.cities.join(", ") || "Any"}</p></div>
                      <div><span className="text-xs text-zinc-500">ZIP Codes</span><p className="text-sm">{pref.zipCodes.join(", ") || "Any"}</p></div>
                      <div><span className="text-xs text-zinc-500">Property Types</span><p className="text-sm">{pref.propertyTypes.length > 0 ? pref.propertyTypes.map((t: string) => t.replace("_", " ")).join(", ") : "Any"}</p></div>
                      <div><span className="text-xs text-zinc-500">Beds</span><p className="text-sm">{pref.minBeds ?? "—"} – {pref.maxBeds ?? "—"}</p></div>
                      <div><span className="text-xs text-zinc-500">Price Range</span><p className="text-sm">${pref.minPrice?.toLocaleString() ?? "0"} – ${pref.maxPrice?.toLocaleString() ?? "Any"}</p></div>
                      <div><span className="text-xs text-zinc-500">Max ARV</span><p className="text-sm">{pref.maxArv ? `$${pref.maxArv.toLocaleString()}` : "Any"}</p></div>
                      <div><span className="text-xs text-zinc-500">Max Repair</span><p className="text-sm">{pref.maxRepairCost ? `$${pref.maxRepairCost.toLocaleString()}` : "Any"}</p></div>
                    </div>
                    {pref.notes && (<div><span className="text-xs text-zinc-500">Notes</span><p className="text-sm text-zinc-400">{pref.notes}</p></div>)}
                  </div>
                )}
                {isExpanded && !pref && (<div className="px-4 pb-4 border-t border-zinc-800 pt-3"><p className="text-sm text-zinc-500">No preferences set.</p></div>)}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="py-12 text-center text-sm text-zinc-600">No buyers found.</div>}
        </div>
      )}
    </div>
  );
}
