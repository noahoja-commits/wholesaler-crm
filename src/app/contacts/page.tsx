"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, Plus, Phone, Mail, MapPin, Filter, Trash2, Download } from "lucide-react";
import { useApi, useDebounce } from "@/lib/hooks";
import { ContactForm } from "@/components/ContactForm";
import { useToast } from "@/components/Toast";
import { exportContactsToCSV } from "@/lib/export";
import type { Contact } from "@/types";

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounce(search, 300);
  const toast = useToast();

  const url = useMemo(() => {
    const params = new URLSearchParams({ orgId: "org_demo", limit: "100" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    return `/api/contacts?${params}`;
  }, [debouncedSearch]);

  const { data, loading, refetch } = useApi<{ contacts: Contact[]; total: number }>(url);
  const contacts = useMemo(() => data?.contacts || [], [data?.contacts]);

  const handleCreated = useCallback(() => refetch(), [refetch]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    toast.success("Contact deleted");
    refetch();
  }, [refetch, toast]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} contacts?`)) return;

    const ids = Array.from(selectedIds);
    await Promise.all(ids.map(id => fetch(`/api/contacts/${id}`, { method: "DELETE" })));
    setSelectedIds(new Set());
    toast.success(`${ids.length} contacts deleted`);
    refetch();
  }, [selectedIds, refetch, toast]);

  const handleExport = useCallback(() => {
    const toExport = selectedIds.size > 0
      ? contacts.filter(c => selectedIds.has(c.id))
      : contacts;
    exportContactsToCSV(toExport);
    toast.success(`Exported ${toExport.length} contacts to CSV`);
  }, [contacts, selectedIds, toast]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => 
      prev.size === contacts.length ? new Set() : new Set(contacts.map(c => c.id))
    );
  }, [contacts]);

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Contacts</h2>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            {data?.total ?? contacts.length} contacts
            {selectedIds.size > 0 && <span className="ml-2 text-emerald-400">({selectedIds.size} selected)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button className="btn-ghost text-red-400 hover:bg-red-400/10" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4" /> Delete Selected
            </button>
          )}
          <button className="btn-ghost" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add Contact</button>
        </div>
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
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === contacts.length && contacts.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-[var(--color-border)]"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Source</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                      className="rounded border-[var(--color-border)]"
                    />
                  </td>
                  <td className="px-4 py-3"><span className="font-medium text-sm">{contact.firstName} {contact.lastName}</span></td>
                  <td className="px-4 py-3"><span className="badge badge-muted">{contact.type.replace("_", " ")}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">{contact.phone && (<span className="flex items-center gap-1"><Phone className="h-3 w-3" />{contact.phone}</span>)}{contact.email && (<span className="flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</span>)}</div></td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-tertiary)]">{contact.city && (<span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{contact.city}, {contact.state}</span>)}</td>
                  <td className="px-4 py-3"><span className={contact.status === "ACTIVE" ? "badge badge-accent" : contact.status === "DO_NOT_CONTACT" ? "badge bg-red-400/10 text-red-400" : "badge badge-muted"}>{contact.status.replace("_", " ")}</span></td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-tertiary)]">{contact.source?.replace("_", " ") || "—"}</td>
                  <td className="px-2 py-3">
                    <button onClick={() => handleDelete(contact.id)} className="p-1.5 rounded-md text-[var(--color-text-tertiary)] hover:text-red-400 hover:bg-red-400/10 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {contacts.length === 0 && <div className="py-16 text-center text-sm text-[var(--color-text-tertiary)]">No contacts found</div>}
        </div>
      )}
      <ContactForm open={showForm} onClose={() => setShowForm(false)} onCreated={handleCreated} />
    </div>
  );
}
