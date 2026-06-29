/**
 * Input sanitization utilities for API routes.
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Sanitize a string by removing potential XSS characters.
 */
export function sanitizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  // Remove null bytes and trim
  const sanitized = value.replace(/\0/g, "").trim();
  // Limit length to prevent DoS
  return sanitized.length > 10000 ? sanitized.slice(0, 10000) : sanitized;
}

/**
 * Sanitize a number, returning null for invalid values.
 */
export function sanitizeNumber(value: unknown): number | null {
  if (typeof value === "number" && isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Sanitize an array of strings.
 */
export function sanitizeStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value
    .slice(0, 100) // Limit array size
    .map((v) => sanitizeString(v))
    .filter((v): v is string => v !== null && v.length > 0);
}

/**
 * Extract and sanitize pagination params safely.
 */
export function sanitizePagination(rawLimit?: string | null, rawOffset?: string | null) {
  const limit = Math.min(Math.max(Number(rawLimit) || 20, 1), 200);
  const offset = Math.max(Number(rawOffset) || 0, 0);
  return { limit, offset };
}

/**
 * Validate that an orgId matches expected format.
 */
export function sanitizeOrgId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  // Basic validation: alphanumeric, dashes, underscores, 1-64 chars
  if (/^[a-zA-Z0-9_-]{1,64}$/.test(value)) return value;
  return null;
}

/**
 * Check request size to prevent large payload attacks.
 */
export function validateRequestSize(request: NextRequest, maxBytes = 1024 * 1024): NextResponse | null {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    return NextResponse.json({ error: "Request payload too large" }, { status: 413 });
  }
  return null;
}

/**
 * Log potentially suspicious requests.
 */
export function logSuspiciousRequest(request: Request, reason: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  console.warn(`[SECURITY] ${reason} | IP: ${ip} | Path: ${request.url}`);
}
