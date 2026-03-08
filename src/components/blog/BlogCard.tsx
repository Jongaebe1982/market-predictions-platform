import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { BlogPostMeta } from '@/lib/blog-types';
import { cn } from '@/lib/utils';

const categoryColors: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  comparison: 'default',
  accuracy: 'success',
  analysis: 'info',
  insights: 'warning',
};

interface BlogCardProps {
  post: BlogPostMeta;
  className?: string;
}

export function BlogCard({ post, className }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className={cn('h-full hover:shadow-md transition-shadow', className)}>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={categoryColors[post.category] || 'default'}>
              {post.category}
            </Badge>
            <span className="text-xs text-gray-500">{formatDate(post.publishedAt)}</span>
          </div>
          <CardTitle className="line-clamp-2">{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">{post.excerpt}</p>

          {post.featuredStats.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {post.featuredStats.slice(0, 2).map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-lg font-bold text-blue-600">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="muted" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{post.tags.length - 3}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
