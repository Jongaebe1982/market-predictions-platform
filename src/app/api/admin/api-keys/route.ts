import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { generateApiKey, revokeApiKey } from '@/lib/api-auth';

/**
 * Admin endpoints for API key management
 * Protected by CRON_SECRET (same as cron jobs)
 */

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

/**
 * GET /api/admin/api-keys
 * List all API keys
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const snapshot = await db.collection('api-keys').get();

    const keys = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        key: doc.id,
        email: data.email,
        name: data.name,
        tier: data.tier,
        active: data.active,
        createdAt: data.createdAt,
        lastUsedAt: data.lastUsedAt,
        requestCount: data.requestCount,
        dailyLimit: data.dailyLimit,
      };
    });

    return NextResponse.json({
      data: keys,
      meta: { total: keys.length },
    });
  } catch (error) {
    console.error('Admin API keys list error:', error);
    return NextResponse.json(
      { error: 'Failed to list API keys' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/api-keys
 * Generate a new API key
 *
 * Body: { email: string, name: string, tier?: 'free' | 'developer' | 'professional' }
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, name, tier = 'free' } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name' },
        { status: 400 }
      );
    }

    if (!['free', 'developer', 'professional'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be: free, developer, or professional' },
        { status: 400 }
      );
    }

    const key = await generateApiKey(email, name, tier);

    return NextResponse.json({
      success: true,
      data: {
        key,
        email,
        name,
        tier,
        message: 'Store this key securely - it cannot be retrieved later',
      },
    });
  } catch (error) {
    console.error('Admin API key generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/api-keys
 * Revoke an API key
 *
 * Body: { key: string }
 */
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required field: key' },
        { status: 400 }
      );
    }

    await revokeApiKey(key);

    return NextResponse.json({
      success: true,
      message: 'API key revoked',
    });
  } catch (error) {
    console.error('Admin API key revocation error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
