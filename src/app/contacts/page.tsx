"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Phone, Mail, MapPin, Filter } from "lucide-react";
import { useApi, useDebounce } from "@/lib/hooks";
import type { Contact } from "@/types";

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const url = useMemo(() => {
    const params = new URLSearchParams({ orgId: "default", limit: "100" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    return `/api/contacts?${params}`;
  }, [debouncedSearch]);

  const { data, loading } = useApi<{ contacts: Contact[]; total: number }>(url);

  const contacts = data?.contacts || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contacts</h2>
          <p className="text-sm text-zinc-500 mt-1">{data?.total ?? contacts.length} contacts</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors">
          <Plus className="h-4 w-4" /> Add Contact
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 border border-zinc-800 rounded-md hover:bg-zinc-900">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-zinc-500">Loading contacts...</div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Location</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Source</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-sm">{contact.firstName} {contact.lastName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{contact.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      {contact.phone && (<span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {contact.phone}</span>)}
                      {contact.email && (<span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {contact.email}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {contact.city && (<span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {contact.city}, {contact.state}</span>)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${contact.status === "ACTIVE" ? "bg-emerald-400/10 text-emerald-400" : contact.status === "DO_NOT_CONTACT" ? "bg-red-400/10 text-red-400" : "bg-zinc-800 text-zinc-500"}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{contact.source?.replace("_", " ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {contacts.length === 0 && <div className="py-12 text-center text-sm text-zinc-600">No contacts found</div>}
        </div>
      )}
    </div>
  );
}
