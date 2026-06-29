"use client";

import { useApi } from "@/lib/hooks";
import { Plus, FileText, Download, CheckCircle } from "lucide-react";

interface Document {
  id: string; dealId: string; name: string; type: string;
  signed: boolean; signedAt: string | null; createdAt: string;
  deal?: { title: string }; template?: { name: string };
}

const TYPE_LABELS: Record<string, string> = {
  PURCHASE_AGREEMENT: "Purchase Agreement", ASSIGNMENT_CONTRACT: "Assignment Contract",
  AFFIDAVIT: "Affidavit", DISCLOSURE: "Disclosure", INVOICE: "Invoice",
  MARKETING_LETTER: "Marketing Letter", PROOF_OF_FUNDS: "Proof of Funds", OTHER: "Other",
};

const TEMPLATES = [
  { name: "Purchase Agreement", type: "PURCHASE_AGREEMENT", desc: "Standard real estate purchase contract" },
  { name: "Assignment of Contract", type: "ASSIGNMENT_CONTRACT", desc: "Wholesale assignment agreement" },
  { name: "Proof of Funds", type: "PROOF_OF_FUNDS", desc: "Buyer POF letter template" },
];

export default function DocumentsPage() {
  const { data, loading } = useApi<{ documents: Document[] }>("/api/documents?orgId=default");
  const documents = data?.documents || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Documents</h2><p className="text-sm text-zinc-500 mt-1">Contracts, agreements, and templates</p></div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors"><Plus className="h-4 w-4" /> Generate Document</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-pulse text-zinc-500">Loading documents...</div></div>
      ) : documents.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <FileText className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-zinc-400">No documents yet</h3>
          <p className="text-xs text-zinc-600 mt-1 mb-4">Documents are generated from deals.</p>
          <code className="text-xs bg-zinc-800 px-2 py-1 rounded">POST /api/documents {"{ dealId, type }"}</code>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center"><FileText className="h-5 w-5 text-zinc-400" /></div>
                <div><h3 className="font-medium text-sm">{doc.name}</h3><p className="text-xs text-zinc-500">{TYPE_LABELS[doc.type] || doc.type} • {doc.deal?.title || "No deal"} • {new Date(doc.createdAt).toLocaleDateString()}</p></div>
              </div>
              <div className="flex items-center gap-3">
                {doc.signed ? <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="h-3 w-3" /> Signed</span> : <span className="text-xs text-zinc-500">Unsigned</span>}
                <button className="p-2 text-zinc-500 hover:text-zinc-300 rounded-md hover:bg-zinc-800"><Download className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Document Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TEMPLATES.map((template) => (
            <div key={template.type} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2 mb-2"><FileText className="h-4 w-4 text-zinc-500" /><span className="text-sm font-medium">{template.name}</span></div>
              <p className="text-xs text-zinc-500">{template.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
