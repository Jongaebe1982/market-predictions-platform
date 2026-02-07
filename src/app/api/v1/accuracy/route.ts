import { NextRequest, NextResponse } from 'next/server';
import { fetchCachedAccuracyMetrics } from '@/lib/accuracy-compute';
import { extractApiKey, validateApiKey, trackApiKeyUsage, checkRateLimit, addRateLimitHeaders } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/accuracy
 * Returns overall accuracy metrics including Brier scores and hit rates
 *
 * Headers:
 *   - Authorization: Bearer <api-key>
 *
 * Query params:
 *   - breakdown: 'source' | 'sector' | 'horizon' | 'volume' | 'all' (default: 'all')
 */
export async function GET(request: NextRequest) {
  // Validate API key
  const key = extractApiKey(request);
  if (!key) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'API key required. Include header: Authorization: Bearer <your-api-key>' },
      { status: 401 }
    );
  }

  const apiKey = await validateApiKey(key);
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or inactive API key' },
      { status: 401 }
    );
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(key, apiKey.tier);
  if (!rateLimit.allowed) {
    return addRateLimitHeaders(
      NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Daily limit of ${rateLimit.limit} requests exceeded. Resets at ${rateLimit.resetAt}`,
        },
        { status: 429 }
      ),
      rateLimit
    );
  }

  // Track usage (non-blocking)
  trackApiKeyUsage(key).catch(() => {});

  try {
    const { searchParams } = new URL(request.url);
    const breakdown = searchParams.get('breakdown') || 'all';

    const metrics = await fetchCachedAccuracyMetrics();

    const response: Record<string, unknown> = {
      overall: {
        totalResolved: metrics.overall.totalResolved,
        averageBrierScore: metrics.overall.averageBrierScore,
        hitRate: metrics.overall.hitRate,
        calibrationData: metrics.overall.calibrationData,
      },
      lastUpdated: metrics.lastUpdated,
    };

    // Add requested breakdowns
    if (breakdown === 'source' || breakdown === 'all') {
      response.bySource = metrics.bySource.map((s) => ({
        source: s.source,
        resolvedCount: s.resolvedCount,
        averageBrierScore: s.averageBrierScore,
        hitRate: s.hitRate,
        byHorizon: s.byHorizon,
      }));
    }

    if (breakdown === 'sector' || breakdown === 'all') {
      response.bySector = metrics.bySector.map((s) => ({
        sector: s.sector,
        resolvedCount: s.resolvedCount,
        averageBrierScore: s.averageBrierScore,
        hitRate: s.hitRate,
      }));
    }

    if (breakdown === 'horizon' || breakdown === 'all') {
      response.byHorizon = metrics.byHorizon.map((h) => ({
        horizon: h.horizon,
        label: h.label,
        hoursBeforeResolution: h.hoursBeforeResolution,
        sampleSize: h.sampleSize,
        averageBrierScore: h.averageBrierScore,
        hitRate: h.hitRate,
      }));
    }

    if (breakdown === 'volume' || breakdown === 'all') {
      response.byVolume = metrics.byVolume.map((v) => ({
        bucket: v.bucket,
        minVolume: v.minVolume,
        maxVolume: v.maxVolume,
        resolvedCount: v.resolvedCount,
        averageBrierScore: v.averageBrierScore,
        hitRate: v.hitRate,
      }));
    }

    return NextResponse.json({
      data: response,
    });
  } catch (error) {
    console.error('API v1 accuracy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accuracy metrics', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
