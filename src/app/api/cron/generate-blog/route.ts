import { NextResponse } from 'next/server';
import { getAccuracyMetricsWithFallback } from '@/lib/accuracy-compute';
import { generateBlogPosts } from '@/lib/blog-generator';
import { saveBlogPost } from '@/lib/blog';

/**
 * Cron job to generate/update blog posts with fresh accuracy data.
 * This endpoint creates or updates blog posts based on predefined templates.
 *
 * POST /api/cron/generate-blog
 *
 * Authorization: Requires CRON_SECRET header matching environment variable
 */
export async function POST(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting blog generation...');

    // Fetch latest accuracy metrics
    const metrics = await getAccuracyMetricsWithFallback();

    if (metrics.overall.totalResolved === 0) {
      console.log('No accuracy data available, skipping blog generation');
      return NextResponse.json({
        success: true,
        message: 'No accuracy data available',
        generated: 0,
      });
    }

    // Generate blog posts from templates
    const posts = generateBlogPosts(metrics);

    // Save each post (upsert based on slug)
    const results = await Promise.all(
      posts.map(async (post) => {
        try {
          const id = await saveBlogPost(post);
          return { slug: post.slug, id, status: 'success' };
        } catch (error) {
          console.error(`Error saving post ${post.slug}:`, error);
          return { slug: post.slug, status: 'error', error: String(error) };
        }
      })
    );

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    console.log(`Blog generation complete: ${successCount} success, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      generated: successCount,
      errors: errorCount,
      results,
    });
  } catch (error) {
    console.error('Blog generation failed:', error);
    return NextResponse.json(
      { error: 'Blog generation failed', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check cron status
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/cron/generate-blog',
    method: 'POST',
    description: 'Generates blog posts from accuracy data templates',
    authorization: 'Bearer token required (CRON_SECRET)',
  });
}
