"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/Modal";
import { useApi } from "@/lib/hooks";

interface DocumentFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultType?: string;
}

interface FormData {
  dealId: string;
  type: string;
}

export function DocumentForm({ open, onClose, onCreated, defaultType = "PURCHASE_AGREEMENT" }: DocumentFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { data: dealsData } = useApi<{ deals: Array<{ id: string; title: string }> }>(
    open ? "/api/deals?orgId=org_demo&limit=100" : null
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { type: defaultType },
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: data.dealId, type: data.type }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate document");
      }
      reset();
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  const deals = dealsData?.deals || [];

  return (
    <Modal open={open} onClose={onClose} title="Generate Document" description="Generate a contract from an existing deal.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</div>}

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Deal *</label>
          <select {...register("dealId", { required: "Please select a deal" })} className="input">
            <option value="">Select deal...</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
          {errors.dealId && <p className="text-xs text-red-400 mt-1">{errors.dealId.message}</p>}
          {deals.length === 0 && <p className="text-xs text-[var(--color-text-tertiary)] mt-1">No deals available — create a deal first.</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Document Type</label>
          <select {...register("type")} className="input">
            <option value="PURCHASE_AGREEMENT">Purchase Agreement</option>
            <option value="ASSIGNMENT_CONTRACT">Assignment Contract</option>
            <option value="PROOF_OF_FUNDS">Proof of Funds</option>
            <option value="AFFIDAVIT">Affidavit</option>
            <option value="DISCLOSURE">Disclosure</option>
            <option value="INVOICE">Invoice</option>
            <option value="MARKETING_LETTER">Marketing Letter</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Generating..." : "Generate Document"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
