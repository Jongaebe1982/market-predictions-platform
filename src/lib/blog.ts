import { getAdminDb } from './firebase-admin';
import type { BlogPost, BlogPostMeta, PaginatedBlogPosts } from './blog-types';

const COLLECTION = 'blog-posts';

/**
 * Get paginated list of published blog posts
 */
export async function getBlogPosts(page = 1, limit = 10): Promise<PaginatedBlogPosts> {
  try {
    const db = getAdminDb();
    const collection = db.collection(COLLECTION);

    // Get total count of published posts
    const countSnapshot = await collection
      .where('status', '==', 'published')
      .count()
      .get();
    const total = countSnapshot.data().count;

    // Get paginated posts
    const offset = (page - 1) * limit;
    const snapshot = await collection
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc')
      .offset(offset)
      .limit(limit)
      .get();

    const posts: BlogPostMeta[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        publishedAt: data.publishedAt,
        tags: data.tags || [],
        category: data.category,
        featuredStats: data.featuredStats || [],
      };
    });

    return {
      posts,
      total,
      page,
      pageSize: limit,
      hasMore: offset + posts.length < total,
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return {
      posts: [],
      total: 0,
      page,
      pageSize: limit,
      hasMore: false,
    };
  }
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection(COLLECTION)
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      publishedAt: data.publishedAt,
      updatedAt: data.updatedAt,
      tags: data.tags || [],
      category: data.category,
      featuredStats: data.featuredStats || [],
      relatedTickers: data.relatedTickers || [],
      relatedMarketSlugs: data.relatedMarketSlugs || [],
      status: data.status,
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

/**
 * Get blog posts by tag
 */
export async function getBlogPostsByTag(tag: string, limit = 10): Promise<BlogPostMeta[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection(COLLECTION)
      .where('status', '==', 'published')
      .where('tags', 'array-contains', tag)
      .orderBy('publishedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        publishedAt: data.publishedAt,
        tags: data.tags || [],
        category: data.category,
        featuredStats: data.featuredStats || [],
      };
    });
  } catch (error) {
    console.error('Error fetching blog posts by tag:', error);
    return [];
  }
}

/**
 * Get related blog posts based on tags and category
 */
export async function getRelatedPosts(
  currentSlug: string,
  tags: string[],
  category: string,
  limit = 3
): Promise<BlogPostMeta[]> {
  try {
    const db = getAdminDb();

    // First try to get posts with matching tags
    if (tags.length > 0) {
      const tagSnapshot = await db
        .collection(COLLECTION)
        .where('status', '==', 'published')
        .where('tags', 'array-contains-any', tags.slice(0, 10)) // Firestore limit
        .orderBy('publishedAt', 'desc')
        .limit(limit + 1) // +1 to account for current post
        .get();

      const posts = tagSnapshot.docs
        .filter((doc) => doc.data().slug !== currentSlug)
        .slice(0, limit)
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            slug: data.slug,
            title: data.title,
            excerpt: data.excerpt,
            publishedAt: data.publishedAt,
            tags: data.tags || [],
            category: data.category,
            featuredStats: data.featuredStats || [],
          };
        });

      if (posts.length >= limit) return posts;

      // If not enough, get more by category
      const remaining = limit - posts.length;
      const existingSlugs = new Set([currentSlug, ...posts.map((p) => p.slug)]);

      const categorySnapshot = await db
        .collection(COLLECTION)
        .where('status', '==', 'published')
        .where('category', '==', category)
        .orderBy('publishedAt', 'desc')
        .limit(remaining + existingSlugs.size)
        .get();

      const morePosts = categorySnapshot.docs
        .filter((doc) => !existingSlugs.has(doc.data().slug))
        .slice(0, remaining)
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            slug: data.slug,
            title: data.title,
            excerpt: data.excerpt,
            publishedAt: data.publishedAt,
            tags: data.tags || [],
            category: data.category,
            featuredStats: data.featuredStats || [],
          };
        });

      return [...posts, ...morePosts];
    }

    // Fallback to category-based posts
    const snapshot = await db
      .collection(COLLECTION)
      .where('status', '==', 'published')
      .where('category', '==', category)
      .orderBy('publishedAt', 'desc')
      .limit(limit + 1)
      .get();

    return snapshot.docs
      .filter((doc) => doc.data().slug !== currentSlug)
      .slice(0, limit)
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          publishedAt: data.publishedAt,
          tags: data.tags || [],
          category: data.category,
          featuredStats: data.featuredStats || [],
        };
      });
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

/**
 * Get all blog post slugs for sitemap
 */
export async function getAllBlogSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection(COLLECTION)
      .where('status', '==', 'published')
      .select('slug', 'updatedAt')
      .get();

    return snapshot.docs.map((doc) => ({
      slug: doc.data().slug,
      updatedAt: doc.data().updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching blog slugs:', error);
    return [];
  }
}

/**
 * Save or update a blog post
 */
export async function saveBlogPost(post: Omit<BlogPost, 'id'>): Promise<string> {
  const db = getAdminDb();
  const collection = db.collection(COLLECTION);

  // Check if post with this slug already exists
  const existing = await collection.where('slug', '==', post.slug).limit(1).get();

  if (!existing.empty) {
    // Update existing post
    const docId = existing.docs[0].id;
    await collection.doc(docId).update({
      ...post,
      updatedAt: new Date().toISOString(),
    });
    return docId;
  }

  // Create new post
  const docRef = await collection.add({
    ...post,
    publishedAt: post.publishedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return docRef.id;
}
