"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/Modal";
import { createPropertySchema } from "@/lib/schemas";
import { z } from "zod";

type FormData = z.input<typeof createPropertySchema>;

interface PropertyFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function PropertyForm({ open, onClose, onCreated }: PropertyFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: { propertyType: "SINGLE_FAMILY", status: "NEW_LEAD" },
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

  return (
    <Modal open={open} onClose={onClose} title="Add Property" description="Add a new lead property to your pipeline." size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</div>}

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Street Address *</label>
          <input {...register("street")} className="input" placeholder="123 Main St" />
          {errors.street && <p className="text-xs text-red-400 mt-1">{errors.street.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">City *</label>
            <input {...register("city")} className="input" placeholder="Austin" />
            {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">State *</label>
            <input {...register("state")} className="input" placeholder="TX" />
            {errors.state && <p className="text-xs text-red-400 mt-1">{errors.state.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">ZIP *</label>
            <input {...register("zip")} className="input" placeholder="78701" />
            {errors.zip && <p className="text-xs text-red-400 mt-1">{errors.zip.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Beds</label>
            <input {...register("beds", { valueAsNumber: true })} type="number" className="input" placeholder="3" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Baths</label>
            <input {...register("baths", { valueAsNumber: true })} type="number" step="0.5" className="input" placeholder="2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Sq Ft</label>
            <input {...register("sqft", { valueAsNumber: true })} type="number" className="input" placeholder="1500" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">ARV ($)</label>
            <input {...register("arv", { valueAsNumber: true })} type="number" className="input" placeholder="300000" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Repair Cost ($)</label>
            <input {...register("repairCost", { valueAsNumber: true })} type="number" className="input" placeholder="40000" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Property Type</label>
            <select {...register("propertyType")} className="input">
              <option value="SINGLE_FAMILY">Single Family</option>
              <option value="MULTI_FAMILY">Multi Family</option>
              <option value="CONDO">Condo</option>
              <option value="TOWNHOUSE">Townhouse</option>
              <option value="LAND">Land</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Foreclosure Status</label>
            <select {...register("foreclosureStatus")} className="input">
              <option value="">None</option>
              <option value="PRE_FORECLOSURE">Pre-Foreclosure</option>
              <option value="AUCTION_SCHEDULED">Auction Scheduled</option>
              <option value="BANK_OWNED">Bank Owned (REO)</option>
              <option value="SHORT_SALE">Short Sale</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Status</label>
            <select {...register("status")} className="input">
              <option value="NEW_LEAD">New Lead</option>
              <option value="CONTACTED">Contacted</option>
              <option value="APPOINTMENT_SCHEDULED">Appointment Scheduled</option>
              <option value="OFFER_MADE">Offer Made</option>
              <option value="UNDER_CONTRACT">Under Contract</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Notes</label>
          <textarea {...register("notes")} className="input" rows={2} placeholder="Property condition notes..." />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Creating..." : "Create Property"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
