/**
 * Daily call usage tracking and rate limiting.
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
 * Otherwise, rate limiting is skipped (all requests allowed) for local dev.
 */

import { createHash } from 'crypto';
import { NextRequest } from 'next/server';
import type { PlanId } from './plans';
import { getPlan } from './plans';

export interface UsageContext {
  identifier: string;
  planId: PlanId;
  limit: number;
  current: number;
  remaining: number;
  date: string; // yyyy-mm-dd UTC
  /** Unix seconds when the daily window resets (start of next UTC day) */
  resetAt: number;
}

export interface CheckResult {
  allowed: boolean;
  context: UsageContext;
  /** If not allowed, message for 429 response */
  message?: string;
}

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const ENABLED = Boolean(REDIS_URL && REDIS_TOKEN);

/** Parse RATE_LIMIT_API_KEYS env (e.g. "key1:900,key2:3600") into Map<key, planId> */
function parseApiKeyPlans(): Map<string, PlanId> {
  const raw = process.env.RATE_LIMIT_API_KEYS;
  if (!raw?.trim()) return new Map();
  const map = new Map<string, PlanId>();
  const validPlans = new Set<PlanId>(['free', '900', '3600', '18000', '36000', '72000']);
  for (const part of raw.split(',')) {
    const [key, plan] = part.split(':').map((s) => s.trim());
    if (key && plan && validPlans.has(plan as PlanId)) {
      map.set(key, plan as PlanId);
    }
  }
  return map;
}

let apiKeyPlansCache: Map<string, PlanId> | null = null;

function getApiKeyPlans(): Map<string, PlanId> {
  if (apiKeyPlansCache === null) {
    apiKeyPlansCache = parseApiKeyPlans();
  }
  return apiKeyPlansCache;
}

function hash(s: string): string {
  return createHash('sha256').update(s).digest('hex').slice(0, 32);
}

/** Get UTC date string yyyy-mm-dd */
function utcDateString(d: Date = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Unix seconds for start of next UTC day */
function nextMidnightUtc(): number {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

/**
 * Extract rate-limit identifier from request.
 * Uses x-api-key if present (plan from RATE_LIMIT_API_KEYS), else IP (plan = free).
 */
export function getIdentifier(request: NextRequest): { identifier: string; planId: PlanId } {
  const apiKey = request.headers.get('x-api-key')?.trim();
  if (apiKey) {
    const plans = getApiKeyPlans();
    const planId = plans.get(apiKey) ?? 'free';
    return { identifier: apiKey, planId };
  }
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0]?.trim() : null;
  const realIp = request.headers.get('x-real-ip')?.trim();
  const identifier = ip || realIp || 'anonymous';
  return { identifier, planId: 'free' };
}

function usageKey(identifier: string, date: string): string {
  return `usage:${hash(identifier)}:${date}`;
}

async function getRedis() {
  if (!ENABLED) return null;
  const { Redis } = await import('@upstash/redis');
  return new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! });
}

/**
 * Check if the identifier is within its daily limit.
 * Call this before processing an API request.
 */
export async function checkUsage(request: NextRequest): Promise<CheckResult> {
  const { identifier, planId } = getIdentifier(request);
  const plan = getPlan(planId);
  const limit = plan.callsPerDay;
  const date = utcDateString();
  const resetAt = nextMidnightUtc();

  if (!ENABLED) {
    return {
      allowed: true,
      context: {
        identifier: '[rate-limit disabled]',
        planId,
        limit,
        current: 0,
        remaining: limit,
        date,
        resetAt,
      },
    };
  }

  const redis = await getRedis();
  if (!redis) {
    return {
      allowed: true,
      context: { identifier, planId, limit, current: 0, remaining: limit, date, resetAt },
    };
  }

  const key = usageKey(identifier, date);
  const raw = await redis.get<string>(key);
  const current = typeof raw === 'string' ? parseInt(raw, 10) : typeof raw === 'number' ? raw : 0;
  const safeCurrent = Number.isFinite(current) ? Math.max(0, current) : 0;
  const remaining = Math.max(0, limit - safeCurrent);
  const allowed = safeCurrent < limit;

  const context: UsageContext = {
    identifier,
    planId,
    limit,
    current: safeCurrent,
    remaining,
    date,
    resetAt,
  };

  if (!allowed) {
    return {
      allowed: false,
      context,
      message: `Daily call limit reached (${limit} calls/day). Resets at midnight UTC. Upgrade your plan for more calls.`,
    };
  }

  return { allowed: true, context };
}

/**
 * Increment usage by 1 for the given request's identifier.
 * Call this only after successfully completing an API call (weather or METAR/TAF).
 */
export async function incrementUsage(request: NextRequest): Promise<void> {
  if (!ENABLED) return;
  const redis = await getRedis();
  if (!redis) return;

  const { identifier, planId } = getIdentifier(request);
  const date = utcDateString();
  const key = usageKey(identifier, date);

  await redis.incr(key);
  const ttl = await redis.ttl(key);
  if (ttl === -1) {
    await redis.expireat(key, nextMidnightUtc());
  }
}

/**
 * Build standard rate-limit response headers.
 * @param context - Usage context from checkUsage
 * @param options.consumed - If 1, headers reflect state after this request (remaining -= 1, current += 1).
 */
export function rateLimitHeaders(
  context: UsageContext,
  options?: { consumed?: number }
): Record<string, string> {
  const consumed = options?.consumed ?? 0;
  const remaining = Math.max(0, context.remaining - consumed);
  return {
    'X-RateLimit-Limit': String(context.limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(context.resetAt),
  };
}

export { ENABLED as RATE_LIMIT_ENABLED };
