import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from './firebase-admin';
import { randomUUID } from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';

export interface ApiKey {
  key: string;
  email: string;
  name: string;
  tier: 'free' | 'developer' | 'professional';
  active: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  requestCount: number;
  dailyLimit: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: string;
}

const TIER_LIMITS: Record<string, number> = {
  free: 100,
  developer: 10000,
  professional: 100000,
};

/**
 * Get today's date string for rate limit keys (YYYY-MM-DD in UTC)
 */
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get the reset time (next midnight UTC)
 */
function getResetTime(): string {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

/**
 * Validate an API key and return the key data if valid
 */
export async function validateApiKey(key: string): Promise<ApiKey | null> {
  if (!key) return null;

  try {
    const db = getAdminDb();
    const doc = await db.collection('api-keys').doc(key).get();

    if (!doc.exists) return null;

    const data = doc.data() as Omit<ApiKey, 'key'>;
    if (!data.active) return null;

    return { key, ...data };
  } catch (error) {
    console.error('API key validation error:', error);
    return null;
  }
}

/**
 * Check rate limit for an API key.
 * Returns whether the request is allowed and remaining quota.
 */
export async function checkRateLimit(key: string, tier: string): Promise<RateLimitResult> {
  const limit = TIER_LIMITS[tier] || TIER_LIMITS.free;
  const todayKey = getTodayKey();
  const usageDocId = `${key}_${todayKey}`;

  try {
    const db = getAdminDb();
    const usageRef = db.collection('api-usage').doc(usageDocId);
    const usageDoc = await usageRef.get();

    const currentCount = usageDoc.exists ? (usageDoc.data()?.count || 0) : 0;
    const remaining = Math.max(0, limit - currentCount);

    return {
      allowed: currentCount < limit,
      limit,
      remaining,
      resetAt: getResetTime(),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request but log it
    return { allowed: true, limit, remaining: limit, resetAt: getResetTime() };
  }
}

/**
 * Increment daily usage counter and update last used timestamp.
 * Should be called after successful rate limit check.
 */
export async function trackApiKeyUsage(key: string): Promise<void> {
  const todayKey = getTodayKey();
  const usageDocId = `${key}_${todayKey}`;

  try {
    const db = getAdminDb();

    // Increment daily usage counter
    await db.collection('api-usage').doc(usageDocId).set(
      {
        key,
        date: todayKey,
        count: FieldValue.increment(1),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Update API key metadata
    await db.collection('api-keys').doc(key).update({
      lastUsedAt: new Date().toISOString(),
      requestCount: FieldValue.increment(1),
    });
  } catch (error) {
    console.error('API key usage tracking error:', error);
  }
}

/**
 * Generate a new API key
 */
export async function generateApiKey(
  email: string,
  name: string,
  tier: 'free' | 'developer' | 'professional' = 'free'
): Promise<string> {
  const key = `pm_${randomUUID().replace(/-/g, '')}`;
  const db = getAdminDb();

  await db.collection('api-keys').doc(key).set({
    email,
    name,
    tier,
    active: true,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    requestCount: 0,
    dailyLimit: TIER_LIMITS[tier],
  });

  return key;
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(key: string): Promise<void> {
  const db = getAdminDb();
  await db.collection('api-keys').doc(key).update({ active: false });
}

/**
 * Extract API key from request headers
 */
export function extractApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  // Support "Bearer <key>" and "ApiKey <key>" formats
  const match = authHeader.match(/^(?:Bearer|ApiKey)\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  rateLimit: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimit.resetAt);
  return response;
}

/**
 * Middleware wrapper for protected API routes with rate limiting
 */
export function withApiAuth(
  handler: (request: NextRequest, apiKey: ApiKey, ...args: unknown[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    const key = extractApiKey(request);

    if (!key) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'API key required. Include header: Authorization: Bearer <your-api-key>',
          docs: 'https://predictionmarketanalytics.io/docs/api',
        },
        { status: 401 }
      );
    }

    const apiKey = await validateApiKey(key);

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or inactive API key',
        },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(key, apiKey.tier);

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Daily limit of ${rateLimit.limit} requests exceeded. Resets at ${rateLimit.resetAt}`,
          limit: rateLimit.limit,
          resetAt: rateLimit.resetAt,
          upgrade: 'Contact us to upgrade your plan for higher limits',
        },
        { status: 429 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    // Track usage (non-blocking)
    trackApiKeyUsage(key).catch(() => {});

    // Decrement remaining for accurate header (usage will be tracked)
    rateLimit.remaining = Math.max(0, rateLimit.remaining - 1);

    const response = await handler(request, apiKey, ...args);
    return addRateLimitHeaders(response, rateLimit);
  };
}

/**
 * Optional auth - allows unauthenticated access but provides key data if present
 */
export async function optionalApiAuth(request: NextRequest): Promise<ApiKey | null> {
  const key = extractApiKey(request);
  if (!key) return null;
  return validateApiKey(key);
}
