"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/Modal";
import { createContactSchema } from "@/lib/schemas";
import { z } from "zod";

type FormData = z.input<typeof createContactSchema>;

interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function ContactForm({ open, onClose, onCreated }: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(createContactSchema),
    defaultValues: { type: "SELLER", status: "ACTIVE", tags: [] },
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contacts", {
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
    <Modal open={open} onClose={onClose} title="Add Contact" description="Create a new seller, buyer, or other contact.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">First Name *</label>
            <input {...register("firstName")} className="input" placeholder="John" />
            {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Last Name *</label>
            <input {...register("lastName")} className="input" placeholder="Doe" />
            {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Type</label>
            <select {...register("type")} className="input">
              <option value="SELLER">Seller</option>
              <option value="BUYER">Buyer</option>
              <option value="AGENT">Agent</option>
              <option value="TITLE_COMPANY">Title Company</option>
              <option value="HARD_MONEY">Hard Money Lender</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Status</label>
            <select {...register("status")} className="input">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DO_NOT_CONTACT">Do Not Contact</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Phone</label>
            <input {...register("phone")} className="input" placeholder="555-0100" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Email</label>
            <input {...register("email")} className="input" placeholder="john@email.com" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">City</label>
            <input {...register("city")} className="input" placeholder="Austin" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">State</label>
            <input {...register("state")} className="input" placeholder="TX" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">ZIP</label>
            <input {...register("zip")} className="input" placeholder="78701" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Source</label>
          <select {...register("source")} className="input">
            <option value="">-- Select --</option>
            <option value="DIRECT_MAIL">Direct Mail</option>
            <option value="COLD_CALL">Cold Call</option>
            <option value="SMS">SMS</option>
            <option value="ONLINE_AD">Online Ad</option>
            <option value="REFERRAL">Referral</option>
            <option value="DRIVING_FOR_DOLLARS">Driving for Dollars</option>
            <option value="MLS">MLS</option>
            <option value="PROPSTREAM">PropStream</option>
            <option value="BATCH_LEADS">BatchLeads</option>
            <option value="COUNTY_RECORDS">County Records</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Notes</label>
          <textarea {...register("notes")} className="input" rows={2} placeholder="Any notes about this contact..." />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Creating..." : "Create Contact"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
