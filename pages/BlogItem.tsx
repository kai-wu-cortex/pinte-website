import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SEOMeta, { generateArticleSchema, generateBreadcrumbSchema } from '../components/SEOMeta';
import { 
  ArrowLeft, Calendar, User, Tag, Share2, 
  Clock, ChevronLeft, ChevronRight, Facebook, 
  Twitter, Linkedin, Link as LinkIcon
} from 'lucide-react';
import { fetchBlogArticle, BlogArticle } from '../services/notionBlog';

const BlogItem: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // 实时从 Notion 获取文章内容
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        
        // 从 Notion API 实时获取
        const article = await fetchBlogArticle(slug!);
        
        if (article) {
          setArticle(article);
        } else {
          throw new Error('Article not found');
        }
      } catch (err) {
        setError(lang === 'cn' ? '文章不存在或已被删除' : 'Article not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug, lang]);

  // 复制链接
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'cn' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 估算阅读时间
  const estimateReadTime = (content: string | undefined) => {
    if (!content) return 1;
    const wordsPerMinute = lang === 'cn' ? 300 : 200;
    const words = content.replace(/[#*`\n]/g, '').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  // 分享到社交媒体
  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article?.title || '');
    
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pinte-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="min-h-screen pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            {lang === 'cn' ? '文章不存在' : 'Article Not Found'}
          </h1>
          <p className="text-neutral-500 mb-8">{error}</p>
          <Link 
            to={`/${lang}/blog`}
            className="inline-flex items-center gap-2 text-pinte-blue font-bold"
          >
            <ArrowLeft size={18} />
            {lang === 'cn' ? '返回博客列表' : 'Back to Blog'}
          </Link>
        </div>
      </main>
    );
  }

  // 面包屑结构化数据
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: lang === 'cn' ? '首页' : 'Home', url: `https://www.pintecl.com/${lang}/` },
    { name: lang === 'cn' ? '博客' : 'Blog', url: `https://www.pintecl.com/${lang}/blog/` },
    { name: article.title, url: `https://www.pintecl.com/${lang}/blog/${article.slug}/` }
  ]);

  // 文章结构化数据
  const articleSchema = generateArticleSchema({
    title: article.title,
    description: article.summary,
    image: article.cover,
    datePublished: article.date,
    dateModified: article.date,
    author: article.author,
    url: `/${lang}/blog/${article.slug}`,
    category: article.category,
    tags: article.tags,
    geo: article.geo
  });

  return (
    <>
      <SEOMeta
        title={article.seo?.title || article.title}
        description={article.seo?.description || article.summary}
        keywords={article.seo?.keywords || article.tags}
        image={article.seo?.ogImage || article.cover}
        url={`/${lang}/blog/${article.slug}`}
        type="article"
        publishedTime={article.date}
        author={article.author}
        section={article.category?.[0]}
        tags={article.tags}
        geoRegion={article.geo?.region}
        geoPlacename={article.geo?.locality}
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={`/${lang}/blog/${article.slug}`}
      />
      
      {/* JSON-LD Structure Data */}
      <script type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <main className="min-h-screen pt-24 pb-20">
        {/* Hero Section */}
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <img 
            src={article.cover || 'https://pintepic-1300269931.cos.ap-singapore.myqcloud.com/blog-default.jpg'} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
          
          {/* Back Button */}
          <Link 
            to={`/${lang}/blog`}
            className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/80 hover:text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full transition-colors"
          >
            <ArrowLeft size={18} />
            {lang === 'cn' ? '返回' : 'Back'}
          </Link>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-[800px] mx-auto">
              {/* Category & GEO */}
              <div className="flex flex-wrap gap-2 mb-4">
                {article.category?.map((cat, i) => (
                  <Link
                    key={i}
                    to={`/${lang}/blog?category=${encodeURIComponent(cat)}`}
                    className="px-3 py-1 bg-pinte-blue text-white text-sm font-bold rounded-full hover:bg-pinte-dark transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
                {article.geo?.region && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-full">
                    📍 {article.geo.region}
                  </span>
                )}
              </div>
              
              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
                {article.title}
              </h1>
              
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDate(article.date)}
                </span>
                {article.author && (
                  <span className="flex items-center gap-1">
                    <User size={16} />
                    {article.author}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {estimateReadTime(article.content)} {lang === 'cn' ? '分钟阅读' : 'min read'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-[800px] mx-auto px-6 py-12">
          {/* Share & Tags */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-8 border-b border-neutral-200">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags?.map((tag, i) => (
                <Link
                  key={i}
                  to={`/${lang}/blog?search=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-neutral-100 text-neutral-600 text-sm rounded-full hover:bg-pinte-blue hover:text-white transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 mr-2">
                {lang === 'cn' ? '分享:' : 'Share:'}
              </span>
              <button 
                onClick={() => shareToSocial('facebook')}
                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                title="Facebook"
              >
                <Facebook size={18} />
              </button>
              <button 
                onClick={() => shareToSocial('twitter')}
                className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors"
                title="Twitter"
              >
                <Twitter size={18} />
              </button>
              <button 
                onClick={() => shareToSocial('linkedin')}
                className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </button>
              <button 
                onClick={copyLink}
                className="w-10 h-10 bg-neutral-100 text-neutral-600 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors"
                title={copySuccess ? 'Copied!' : 'Copy Link'}
              >
                {copySuccess ? <span className="text-green-600 text-xs">✓</span> : <LinkIcon size={18} />}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-neutral-50 rounded-2xl p-6 mb-8 border-l-4 border-pinte-blue">
            <p className="text-neutral-700 font-medium leading-relaxed">
              {article.summary}
            </p>
          </div>

          {/* Article Body - 渲染Markdown内容 */}
          {/* Article Body - 渲染Markdown内容 */}
          {(article.content || article.summary) ? (
            <article 
              className="prose prose-lg max-w-none
                prose-headings:font-display prose-headings:font-bold prose-headings:text-neutral-900
                prose-p:text-neutral-600 prose-p:leading-relaxed
                prose-a:text-pinte-blue prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-2xl prose-img:shadow-lg
                prose-blockquote:border-l-pinte-blue prose-blockquote:bg-neutral-50 prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:px-4
                prose-code:bg-neutral-100 prose-code:text-pinte-blue prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-neutral-900 prose-pre:text-white prose-pre:rounded-2xl
                prose-ul:text-neutral-600 prose-ol:text-neutral-600
                prose-li:marker:text-pinte-blue
              "
              dangerouslySetInnerHTML={{ __html: (article.content || article.summary || '')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*)\*/gim, '<em>$1</em>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>')
                .replace(/\n/gim, '<br />')
              }}
            />
          ) : (
            <div className="text-center py-12 bg-neutral-50 rounded-2xl">
              <p className="text-neutral-500 mb-4">
                {lang === 'cn' ? '暂无文章内容' : 'No content available'}
              </p>
              <p className="text-sm text-neutral-400">
                {lang === 'cn'
                  ? '请在 Notion 数据库中添加"正文"字段或在页面中添加内容块' 
                  : 'Please add a "Content" field to the Notion database or add content blocks to the page'}
              </p>
            </div>
          )}

          {/* Author Box */}
          {article.author && (
            <div className="mt-12 p-6 bg-neutral-50 rounded-2xl flex items-center gap-4">
              <div className="w-16 h-16 bg-pinte-blue rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {article.author.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-neutral-900">{article.author}</h4>
                <p className="text-sm text-neutral-500">
                  {lang === 'cn' ? 'PINTE 博客作者' : 'PINTE Blog Author'}
                </p>
              </div>
            </div>
          )}

          {/* Related Articles CTA */}
          <div className="mt-12 p-8 bg-pinte-blue rounded-3xl text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              {lang === 'cn' ? '喜欢这篇文章?' : 'Enjoyed this article?'}
            </h3>
            <p className="text-white/80 mb-6">
              {lang === 'cn'
                ? '探索更多关于烫金膜和包装行业的资讯' 
                : 'Explore more insights about hot stamping foils and packaging industry'}
            </p>
            <Link 
              to={`/${lang}/blog`}
              className="inline-flex items-center gap-2 bg-white text-pinte-blue px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors"
            >
              {lang === 'cn' ? '查看更多文章' : 'View More Articles'}
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default BlogItem;
