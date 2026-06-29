"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/Modal";

interface CampaignFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormData {
  name: string;
  type: string;
  status: string;
  subjectLine: string;
  bodyTemplate: string;
}

export function CampaignForm({ open, onClose, onCreated }: CampaignFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { type: "DIRECT_MAIL", status: "DRAFT" },
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          status: data.status,
          subjectLine: data.subjectLine || null,
          bodyTemplate: data.bodyTemplate || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create campaign");
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
    <Modal open={open} onClose={onClose} title="New Campaign" description="Launch a direct mail, SMS, or email campaign." size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</div>}

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Campaign Name *</label>
          <input {...register("name", { required: "Campaign name is required" })} className="input" placeholder="e.g. July Pre-Foreclosure Mailer" />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Type</label>
            <select {...register("type")} className="input">
              <option value="DIRECT_MAIL">Direct Mail</option>
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
              <option value="RINGLESS_VOICEMAIL">Ringless Voicemail</option>
              <option value="MULTI_CHANNEL">Multi-Channel</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Status</label>
            <select {...register("status")} className="input">
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PAUSED">Paused</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Subject Line</label>
          <input {...register("subjectLine")} className="input" placeholder="We want to buy your house — cash offer inside" />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Message Template</label>
          <textarea {...register("bodyTemplate")} className="input" rows={4} placeholder="Dear {{sellerName}}, we're interested in buying your property at {{propertyAddress}}..." />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
