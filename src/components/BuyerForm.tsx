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
      // Step 1: Create the contact
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          email: data.email || null,
          city: data.city || null,
          state: data.state || null,
          notes: data.notes || null,
          type: "BUYER",
          status: "ACTIVE",
        }),
      });
      if (!res.ok) throw new Error("Failed to create contact");
      const contact = await res.json();

      // Step 2: Save buyer preferences
      const parseArray = (val: string | undefined) =>
        val ? val.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const parseNum = (val: string | undefined) => (val ? parseFloat(val) : null);

      await fetch("/api/buyers/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          states: parseArray(data.states),
          cities: parseArray(data.cities),
          minBeds: parseNum(data.minBeds),
          maxBeds: parseNum(data.maxBeds),
          maxPrice: parseNum(data.maxPrice),
        }),
      });

      reset();
      onCreated();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
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

        {/* Investment Preferences */}
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">Investment Preferences</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">States (comma-separated)</label><input {...register("states")} className="input" placeholder="TX, FL" /></div>
            <div><label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Cities (comma-separated)</label><input {...register("cities")} className="input" placeholder="Austin, Houston" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div><label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Min Beds</label><input {...register("minBeds")} type="number" className="input" placeholder="2" /></div>
            <div><label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Max Beds</label><input {...register("maxBeds")} type="number" className="input" placeholder="5" /></div>
            <div><label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Max Price ($)</label><input {...register("maxPrice")} type="number" className="input" placeholder="500000" /></div>
          </div>
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
