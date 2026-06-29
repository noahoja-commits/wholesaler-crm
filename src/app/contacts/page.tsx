"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Phone, Mail, MapPin, Filter } from "lucide-react";
import { useApi, useDebounce } from "@/lib/hooks";
import type { Contact } from "@/types";

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const url = useMemo(() => {
    const params = new URLSearchParams({ orgId: "org_demo", limit: "100" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    return `/api/contacts?${params}`;
  }, [debouncedSearch]);

  const { data, loading } = useApi<{ contacts: Contact[]; total: number }>(url);
  const contacts = data?.contacts || [];

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Contacts</h2>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">{data?.total ?? contacts.length} contacts</p>
        </div>
        <button className="btn-primary"><Plus className="h-4 w-4" /> Add Contact</button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
          <input
            type="text" placeholder="Search contacts..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <button className="btn-ghost"><Filter className="h-4 w-4" /> Filter</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="flex items-center gap-3 text-[var(--color-text-tertiary)] text-sm"><div className="h-4 w-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" /> Loading contacts...</div></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">
                  <td className="px-4 py-3"><span className="font-medium text-sm">{contact.firstName} {contact.lastName}</span></td>
                  <td className="px-4 py-3"><span className="badge badge-muted">{contact.type.replace("_", " ")}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">{contact.phone && (<span className="flex items-center gap-1"><Phone className="h-3 w-3" />{contact.phone}</span>)}{contact.email && (<span className="flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</span>)}</div></td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-tertiary)]">{contact.city && (<span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{contact.city}, {contact.state}</span>)}</td>
                  <td className="px-4 py-3"><span className={contact.status === "ACTIVE" ? "badge badge-accent" : contact.status === "DO_NOT_CONTACT" ? "badge bg-red-400/10 text-red-400" : "badge badge-muted"}>{contact.status.replace("_", " ")}</span></td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-tertiary)]">{contact.source?.replace("_", " ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {contacts.length === 0 && <div className="py-16 text-center text-sm text-[var(--color-text-tertiary)]">No contacts found</div>}
        </div>
      )}
    </div>
  );
}
