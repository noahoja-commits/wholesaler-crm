import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value == null) return "$0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "0%";
  return `${(value * 100).toFixed(1)}%`;
}

/** Validate and clamp pagination params. Returns [limit, offset] safe for Prisma. */
export function parsePagination(
  limitRaw: string | null,
  offsetRaw: string | null,
  maxLimit = 100
): { limit: number; offset: number } {
  const limit = Number.isFinite(Number(limitRaw)) ? Math.max(1, Math.min(parseInt(limitRaw!), maxLimit)) : 50;
  const offset = Number.isFinite(Number(offsetRaw)) ? Math.max(0, parseInt(offsetRaw!)) : 0;
  return { limit, offset };
}
