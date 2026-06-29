"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/Modal";
import { z } from "zod";

const buyerSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  states: z.string().optional().default("TX"),
  cities: z.string().optional().default(""),
  minBeds: z.string().optional().default(""),
  maxBeds: z.string().optional().default(""),
  maxPrice: z.string().optional().default(""),
});
type FormData = z.input<typeof buyerSchema>;

export function BuyerForm({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormData>({ resolver: zodResolver(buyerSchema) });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, type: "BUYER", status: "ACTIVE" }) });
      if (!res.ok) throw new Error("Failed");
      reset(); onCreated(); onClose();
    } finally { setSubmitting(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Cash Buyer" description="Add a buyer with their investment criteria.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">First Name *</label><input {...register("firstName")} className="input" /></div>
          <div><label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Last Name *</label><input {...register("lastName")} className="input" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Phone</label><input {...register("phone")} className="input" /></div>
          <div><label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Email</label><input {...register("email")} className="input" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">City</label><input {...register("city")} className="input" /></div>
          <div><label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">State</label><input {...register("state")} className="input" placeholder="TX" /></div>
        </div>
        <div><label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Notes</label><textarea {...register("notes")} className="input" rows={2} /></div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? "Adding..." : "Add Buyer"}</button>
        </div>
      </form>
    </Modal>
  );
}
