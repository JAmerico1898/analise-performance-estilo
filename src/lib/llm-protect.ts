// src/lib/llm-protect.ts
// Shared utilities for the /api/llm/* routes:
//   1. getClientIp  — best-effort IP extraction from proxy headers.
//   2. logLlmOrigin — single structured log line with caller identity.
//   3. rateLimit    — per-IP sliding-window limiter (in-memory).
//
// The rate limiter is intentionally in-memory. Under Fluid Compute the same
// instance is reused across concurrent requests, so a caller hammering the
// endpoint will almost certainly hit the same instance and be throttled. A
// cold start resets the counter, which is acceptable for a defensive cap.

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

type Timestamps = number[];
const buckets = new Map<string, Timestamps>();

export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export function logLlmOrigin(
  route: string,
  request: Request,
  payload: Record<string, unknown>,
): void {
  const info = {
    route,
    ts: new Date().toISOString(),
    ip: getClientIp(request),
    ua: request.headers.get("user-agent") ?? "",
    referer: request.headers.get("referer") ?? "",
    origin: request.headers.get("origin") ?? "",
    ...payload,
  };
  console.log(`[llm-origin] ${JSON.stringify(info)}`);
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
  remaining: number;
}

export function rateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const prior = buckets.get(ip) ?? [];
  const kept = prior.filter((t) => t > cutoff);

  if (kept.length >= MAX_REQUESTS_PER_WINDOW) {
    buckets.set(ip, kept);
    const oldest = kept[0] ?? now;
    const retryAfter = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
    return { ok: false, retryAfterSeconds: retryAfter, remaining: 0 };
  }

  kept.push(now);
  buckets.set(ip, kept);

  if (buckets.size > 2000) {
    for (const [key, stamps] of buckets) {
      if (stamps.every((t) => t <= cutoff)) buckets.delete(key);
    }
  }

  return {
    ok: true,
    retryAfterSeconds: 0,
    remaining: MAX_REQUESTS_PER_WINDOW - kept.length,
  };
}
