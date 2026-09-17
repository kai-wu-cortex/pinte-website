/**
 * Static blog data service.
 *
 * Notion is synchronized during the build. Visitors read deployment assets
 * from Cloudflare instead of calling Notion or the API proxy directly.
 */

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  cover: string;
  date: string;
  author: string;
  category: string[];
  tags: string[];
  status: string;
  content?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
  geo: {
    region: string;
    language: string;
    locality: string;
  };
}

const articleCache = new Map<string, BlogArticle>();
const articleRequests = new Map<string, Promise<BlogArticle | null>>();
let articleIndexRequest: Promise<BlogArticle[]> | null = null;

function isBlogArticle(value: unknown): value is BlogArticle {
  if (!value || typeof value !== 'object') return false;
  const article = value as Partial<BlogArticle>;
  return typeof article.slug === 'string' && typeof article.title === 'string';
}

export function getEmbeddedBlogArticle(slug: string): BlogArticle | null {
  if (typeof document === 'undefined') return null;

  const cached = articleCache.get(slug);
  if (cached?.content) return cached;

  const element = document.getElementById('pinte-blog-data');
  if (!element?.textContent) return null;

  try {
    const article = JSON.parse(element.textContent);
    if (!isBlogArticle(article) || article.slug !== slug) return null;
    articleCache.set(slug, article);
    return article;
  } catch (error) {
    console.warn('Invalid embedded blog data:', error);
    return null;
  }
}

export async function fetchBlogArticles(): Promise<BlogArticle[]> {
  if (!articleIndexRequest) {
    articleIndexRequest = fetch('/blog-data/index.json')
      .then(async (response) => {
        if (!response.ok) throw new Error(`Static blog index returned ${response.status}`);
        const payload = await response.json();
        const articles = Array.isArray(payload?.articles)
          ? payload.articles.filter(isBlogArticle)
          : [];
        for (const article of articles) articleCache.set(article.slug, article);
        return articles;
      })
      .catch((error) => {
        console.error('Failed to load static blog index:', error);
        return [];
      });
  }

  return articleIndexRequest;
}

export async function fetchBlogArticle(slug: string): Promise<BlogArticle | null> {
  const embedded = getEmbeddedBlogArticle(slug);
  if (embedded) return embedded;

  const cached = articleCache.get(slug);
  if (cached?.content) return cached;

  let request = articleRequests.get(slug);
  if (!request) {
    request = fetch(`/blog-data/${encodeURIComponent(slug)}.json`)
      .then(async (response) => {
        if (!response.ok) return null;
        const article = await response.json();
        if (!isBlogArticle(article)) return null;
        articleCache.set(slug, article);
        return article;
      })
      .catch((error) => {
        console.error(`Failed to load static blog article ${slug}:`, error);
        return null;
      });
    articleRequests.set(slug, request);
  }

  return request;
}
