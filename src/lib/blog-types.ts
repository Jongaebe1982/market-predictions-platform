export type BlogCategory = 'comparison' | 'accuracy' | 'analysis' | 'insights';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown content
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  category: BlogCategory;
  featuredStats: {
    label: string;
    value: string;
  }[];
  relatedTickers: string[];
  relatedMarketSlugs: string[];
  status: 'draft' | 'published';
}

export interface BlogPostMeta {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  tags: string[];
  category: BlogCategory;
  featuredStats: {
    label: string;
    value: string;
  }[];
}

export interface PaginatedBlogPosts {
  posts: BlogPostMeta[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
