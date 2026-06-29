"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/Modal";
import { createDealSchema } from "@/lib/schemas";
import { z } from "zod";

type FormData = z.input<typeof createDealSchema>;
import { useApi } from "@/lib/hooks";

interface DealFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function DealForm({ open, onClose, onCreated }: DealFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { data: propsData } = useApi<{ properties: Array<{ id: string; street: string; city: string }>; total: number }>(
    open ? "/api/properties?orgId=org_demo&limit=100" : null
  );
  const { data: contactsData } = useApi<{ contacts: Array<{ id: string; firstName: string; lastName: string }>; total: number }>(
    open ? "/api/contacts?orgId=org_demo&limit=100" : null
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(createDealSchema),
    defaultValues: { dealType: "WHOLESALE", priority: "MEDIUM", currentStage: "lead" },
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, pipelineId: "pipeline_main" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
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

  const properties = propsData?.properties || [];
  const contacts = contactsData?.contacts || [];

  return (
    <Modal open={open} onClose={onClose} title="Add Deal" description="Create a new deal in your pipeline." size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</div>}

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Deal Title *</label>
          <input {...register("title")} className="input" placeholder="e.g. Oak Hollow Wholesale" />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Property *</label>
            <select {...register("propertyId")} className="input">
              <option value="">Select property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.street}, {p.city}</option>
              ))}
            </select>
            {errors.propertyId && <p className="text-xs text-red-400 mt-1">{errors.propertyId.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Seller *</label>
            <select {...register("sellerId")} className="input">
              <option value="">Select seller...</option>
              {contacts.filter(c => c.id).map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
            {errors.sellerId && <p className="text-xs text-red-400 mt-1">{errors.sellerId.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Deal Type</label>
            <select {...register("dealType")} className="input">
              <option value="WHOLESALE">Wholesale</option>
              <option value="WHOLE_TAIL">Whole Tail</option>
              <option value="FIX_AND_FLIP">Fix &amp; Flip</option>
              <option value="BUY_AND_HOLD">Buy &amp; Hold</option>
              <option value="NOVATION">Novation</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Priority</label>
            <select {...register("priority")} className="input">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Stage</label>
            <select {...register("currentStage")} className="input">
              <option value="lead">Lead</option>
              <option value="contacted">Contacted</option>
              <option value="appointment">Appointment</option>
              <option value="offer">Offer</option>
              <option value="contract">Contract</option>
              <option value="closing">Closing</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Offer Price ($)</label>
            <input {...register("offerPrice", { valueAsNumber: true })} type="number" className="input" placeholder="200000" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Contract Price ($)</label>
            <input {...register("contractPrice", { valueAsNumber: true })} type="number" className="input" placeholder="210000" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Assignment Fee ($)</label>
            <input {...register("assignmentFee", { valueAsNumber: true })} type="number" className="input" placeholder="15000" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Notes</label>
          <textarea {...register("notes")} className="input" rows={2} placeholder="Deal notes..." />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Creating..." : "Create Deal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
