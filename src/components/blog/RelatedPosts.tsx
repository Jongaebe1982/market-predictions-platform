import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { BlogPostMeta } from '@/lib/blog-types';

interface RelatedPostsProps {
  posts: BlogPostMeta[];
  className?: string;
}

export function RelatedPosts({ posts, className }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Related Articles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 transition-colors">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="muted" className="text-xs">
                      {post.category}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
