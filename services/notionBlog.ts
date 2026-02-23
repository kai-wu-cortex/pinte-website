/**
 * Notion Blog Service
 * 实时从 Notion API 获取博客数据
 * 通过 Vite 代理调用避免 CORS 问题
 */

const API_KEY = import.meta.env.VITE_NOTION_API_KEY;
const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;

// 使用环境变量配置 API 路径
// 本地开发: '/api/notion' (Vite 代理)
// 生产部署: '/api/notion' (EdgeOne 云函数)
const API_BASE = import.meta.env.VITE_API_BASE || '/api/notion';

// 博客数据类型
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

// 调用代理 API
async function notionApiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': '2025-09-03',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Notion API error: ${response.status}`);
  }
  
  return response.json();
}

// 解析页面属性
function parseProperties(page: any): BlogArticle {
  const props = page.properties;
  
  const getTitle = (prop: any) => {
    if (!prop) return '';
    if (prop.type === 'title') return prop.title?.[0]?.plain_text || '';
    return '';
  };

  const getRichText = (prop: any) => {
    if (!prop) return '';
    if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text || '';
    return '';
  };

  const getDate = (prop: any) => {
    if (!prop) return null;
    if (prop.type === 'date') return prop.date?.start || null;
    return null;
  };

  const getMultiSelect = (prop: any) => {
    if (!prop) return [];
    if (prop.type === 'multi_select') return prop.multi_select?.map((item: any) => item.name) || [];
    return [];
  };

  const getSelect = (prop: any) => {
    if (!prop) return null;
    if (prop.type === 'select') return prop.select?.name || null;
    if (prop.type === 'status') return prop.status?.name || null;
    return null;
  };

  const getSlug = (): string => {
    const pageId = page?.id;
    if (pageId) return pageId.replace(/-/g, '');
    return 'default';
  };

  const title = getTitle(props['文章标题'] || props.Name || props.Title || props.title);

  return {
    id: page.id,
    title: title || 'Untitled',
    slug: getSlug(),
    summary: getRichText(props.Summary || props.Description || props.excerpt || props.摘要 || props.描述),
    cover: page.cover?.external?.url || page.cover?.file?.url || '',
    date: getDate(props['截止日期'] || props.Date || props.Published || props.published) || new Date().toISOString(),
    author: getRichText(props.Author || props.author || props.作者),
    category: getMultiSelect(props['主题分类'] || props.Category || props.categories),
    tags: getMultiSelect(props.Tags || props.tag || props.标签),
    status: getSelect(props['写作状态'] || props.Status || props.status || props.publish),
    seo: {
      title: getRichText(props.SEO_Title || props['SEO Title']) || title,
      description: getRichText(props.SEO_Description || props['SEO Description']) || getRichText(props.Summary || props.Description || props.摘要),
      keywords: getMultiSelect(props.SEO_Keywords || props.Keywords || props.keywords),
      ogImage: '',
    },
    geo: {
      region: getSelect(props.GEO_Region || props.Region || props.geo),
      language: getSelect(props.GEO_Language || props.Language || props.lang),
      locality: getRichText(props.GEO_Locality || props.Locality),
    },
  };
}

export async function fetchBlogArticles(): Promise<BlogArticle[]> {
  if (!API_KEY || !DATABASE_ID) {
    console.warn('Notion API credentials not configured');
    return [];
  }

  try {
    const response = await notionApiCall(`/databases/${DATABASE_ID}/query?page_size=100`, {
      method: 'POST',
    });

    const articles = response.results.map((page: any) => parseProperties(page));
    return articles;
  } catch (error) {
    console.error('Failed to fetch blog articles:', error);
    return [];
  }
}

export async function fetchBlogArticle(slug: string): Promise<BlogArticle | null> {
  if (!API_KEY || !DATABASE_ID) return null;

  try {
    // 将 slug 转换回 page ID 格式
    let pageId = slug;
    if (!slug.includes('-')) {
      try {
        pageId = slug.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
      } catch (e) {
        console.error('Failed to format pageId:', e, slug);
        return null;
      }
    }
    
    console.log('Fetching article with pageId:', pageId);
    
    // 获取页面基本信息
    const pageResponse = await notionApiCall(`/pages/${pageId}`, {
      method: 'GET',
    });

    const article = parseProperties(pageResponse);
    
    // 获取页面内容
    // 优先尝试获取 child blocks，如果没有则使用 summary 作为内容
    try {
      console.log('Fetching blocks for page:', pageId);
      const blocksResponse = await notionApiCall(`/blocks/${pageId}/children?page_size=100`, {
        method: 'GET',
      });
      
      console.log('Blocks response:', blocksResponse);
      
      // 将 blocks 转换为简单的 markdown 文本
      if (blocksResponse.results && blocksResponse.results.length > 0) {
        article.content = blocksResponse.results.map((block: any) => {
          if (block.type === 'paragraph') {
            return block.paragraph?.rich_text?.map((t: any) => t.plain_text).join('') || '';
          } else if (block.type === 'heading_1') {
            return '# ' + (block.heading_1?.rich_text?.map((t: any) => t.plain_text).join('') || '');
          } else if (block.type === 'heading_2') {
            return '## ' + (block.heading_2?.rich_text?.map((t: any) => t.plain_text).join('') || '');
          } else if (block.type === 'heading_3') {
            return '### ' + (block.heading_3?.rich_text?.map((t: any) => t.plain_text).join('') || '');
          } else if (block.type === 'bulleted_list_item') {
            return '- ' + (block.bulleted_list_item?.rich_text?.map((t: any) => t.plain_text).join('') || '');
          } else if (block.type === 'numbered_list_item') {
            return '1. ' + (block.numbered_list_item?.rich_text?.map((t: any) => t.plain_text).join('') || '');
          } else if (block.type === 'to_do') {
            return (block.to_do?.checked ? '[x] ' : '[ ] ') + (block.to_do?.rich_text?.map((t: any) => t.plain_text).join('') || '');
          } else if (block.type === 'quote') {
            return '> ' + (block.quote?.rich_text?.map((t: any) => t.plain_text).join('') || '');
          } else if (block.type === 'divider') {
            return '---';
          }
          return '';
        }).join('\n\n');
        console.log('Parsed content from blocks:', article.content.substring(0, 200));
      } 
      
      // 如果没有 blocks 内容，尝试从 properties 获取"正文"字段
      if (!article.content || article.content.trim() === '') {
        // 查找可能的正文字段
        const props = pageResponse.properties;
        const contentFieldNames = ['Content', '正文', '内容', 'body', 'Body', '文章内容'];
        
        for (const fieldName of contentFieldNames) {
          if (props[fieldName]) {
            const field = props[fieldName];
            if (field.type === 'rich_text') {
              article.content = field.rich_text?.map((t: any) => t.plain_text).join('') || '';
              console.log('Found content in field:', fieldName);
              break;
            }
          }
        }
      }
      
      // 如果还是没有内容，使用 summary/描述
      if (!article.content || article.content.trim() === '') {
        console.log('No content found, using summary');
        article.content = article.summary || '（请在 Notion 中添加文章内容）';
      }
    } catch (contentError) {
      console.error('Failed to fetch content:', contentError);
      // 使用 summary 作为后备
      article.content = article.summary || '（请在 Notion 中添加文章内容）';
    }
    
    return article;
  } catch (error) {
    console.error('Failed to fetch blog article:', error);
    return null;
  }
}
