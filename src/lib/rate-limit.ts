/**
 * Simple in-memory rate limiter for API routes.
 * For production, use Redis or a similar distributed store.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // per window per IP

function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export function rateLimit(request: Request): { success: boolean; remaining: number; resetAt: number } {
  const ip = getClientIP(request);
  const now = Date.now();
  const key = `rl:${ip}`;

  const entry = store.get(key);

  // Clean up old entries periodically
  if (store.size > 10000) {
    for (const [k, v] of store) {
      if (v.resetAt < now) store.delete(k);
    }
  }

  if (!entry || entry.resetAt < now) {
    // Start new window
    const resetAt = now + WINDOW_MS;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: MAX_REQUESTS - 1, resetAt };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

export function withRateLimit(handler: (request: Request) => Promise<Response>): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    const { success, remaining, resetAt } = rateLimit(request);

    const headers = {
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
    };

    if (!success) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...headers },
      });
    }

    const response = await handler(request);

    // Add rate limit headers to successful responses too
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: { ...Object.fromEntries(response.headers.entries()), ...headers },
    });
  };
}
