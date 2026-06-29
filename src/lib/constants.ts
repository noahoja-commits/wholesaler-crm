// Shared constants used across the app

/** Default organization ID for single-org deployments */
export const DEFAULT_ORG = "org_demo";

/** Pipeline stage order and colors */
export const PIPELINE_STAGES = [
  "lead",
  "contacted",
  "appointment",
  "offer",
  "contract",
  "closing",
  "closed",
] as const;

export const STAGE_COLORS: Record<string, string> = {
  lead: "#6b7280",
  contacted: "#3b82f6",
  appointment: "#8b5cf6",
  offer: "#eab308",
  contract: "#f97316",
  closing: "#22c55e",
  closed: "#22c55e",
};

/** Property status badge colors */
export const PROPERTY_STATUS_COLORS: Record<string, string> = {
  NEW_LEAD: "bg-blue-400/10 text-blue-400",
  CONTACTED: "bg-purple-400/10 text-purple-400",
  APPOINTMENT_SCHEDULED: "bg-violet-400/10 text-violet-400",
  APPOINTMENT_DONE: "bg-yellow-400/10 text-yellow-400",
  OFFER_MADE: "bg-orange-400/10 text-orange-400",
  UNDER_CONTRACT: "bg-emerald-400/10 text-emerald-400",
  CLOSED: "bg-green-400/10 text-green-400",
  DEAD_LEAD: "bg-zinc-800 text-zinc-500",
  NURTURE: "bg-cyan-400/10 text-cyan-400",
};

/** Campaign status badge colors */
export const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-800 text-zinc-400",
  SCHEDULED: "bg-blue-400/10 text-blue-400",
  IN_PROGRESS: "bg-emerald-400/10 text-emerald-400",
  COMPLETED: "bg-zinc-800 text-zinc-500",
  PAUSED: "bg-yellow-400/10 text-yellow-400",
  CANCELLED: "bg-red-400/10 text-red-400",
};

/** Document type display labels */
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  PURCHASE_AGREEMENT: "Purchase Agreement",
  ASSIGNMENT_CONTRACT: "Assignment Contract",
  AFFIDAVIT: "Affidavit",
  DISCLOSURE: "Disclosure",
  INVOICE: "Invoice",
  MARKETING_LETTER: "Marketing Letter",
  PROOF_OF_FUNDS: "Proof of Funds",
  OTHER: "Other",
};
