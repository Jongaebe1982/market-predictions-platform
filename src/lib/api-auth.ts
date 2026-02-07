import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from './firebase-admin';
import { randomUUID } from 'crypto';

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

const TIER_LIMITS: Record<string, number> = {
  free: 100,
  developer: 10000,
  professional: 100000,
};

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
 * Update last used timestamp and increment request count
 */
export async function trackApiKeyUsage(key: string): Promise<void> {
  try {
    const db = getAdminDb();
    await db.collection('api-keys').doc(key).update({
      lastUsedAt: new Date().toISOString(),
      requestCount: require('firebase-admin').firestore.FieldValue.increment(1),
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
 * Middleware wrapper for protected API routes
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

    // Track usage (non-blocking)
    trackApiKeyUsage(key).catch(() => {});

    return handler(request, apiKey, ...args);
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
