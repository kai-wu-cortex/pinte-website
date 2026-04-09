import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SEOMeta, { generateBreadcrumbSchema } from '../components/SEOMeta';
import { 
  ArrowRight, Search, Calendar, User, Tag, 
  Filter, ChevronRight, Clock
} from 'lucide-react';
import { fetchBlogArticles, BlogArticle } from '../services/notionBlog';

// 静态导入博客数据 (备用)
import blogData from '../data/blog.json';

const BlogCatalog: React.FC = () => {
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || 'all');
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // 实时从 Notion 获取博客数据
  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const fetchedArticles = await fetchBlogArticles();
        if (fetchedArticles.length > 0) {
          setArticles(fetchedArticles);
        } else {
          // 如果 Notion 获取失败，使用静态数据
          setArticles(blogData.articles || []);
        }
      } catch (error) {
        console.error('Failed to fetch from Notion:', error);
        setArticles(blogData.articles || []);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

  // 获取所有分类
  const categories = [...new Set(articles.flatMap(a => a.category || []))];
  
  // 获取所有地区
  const regions = [...new Set(articles.map(a => a.geo?.region).filter(Boolean))];

  // 过滤文章
  const filteredArticles = articles.filter(article => {
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = article.title.toLowerCase().includes(query);
      const matchSummary = article.summary.toLowerCase().includes(query);
      const matchTags = article.tags?.some(t => t.toLowerCase().includes(query));
      if (!matchTitle && !matchSummary && !matchTags) return false;
    }
    
    // 分类过滤
    if (selectedCategory !== 'all' && !article.category?.includes(selectedCategory)) {
      return false;
    }
    
    // 地区过滤
    if (selectedRegion !== 'all' && article.geo?.region !== selectedRegion) {
      return false;
    }
    
    return true;
  });

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedRegion !== 'all') params.set('region', selectedRegion);
    setSearchParams(params);
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

  // 面包屑结构化数据
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: lang === 'cn' ? '首页' : 'Home', url: 'https://pinte.com' },
    { name: lang === 'cn' ? '博客' : 'Blog', url: 'https://pinte.com/blog' }
  ]);

  // 页面标题和描述
  const pageTitle = lang === 'cn' ? '博客中心' : 'Blog Center';
  const pageDesc = lang === 'cn' 
    ? '探索烫金膜行业最新资讯、技术文章和行业见解'
    : 'Explore the latest insights, technical articles and industry knowledge about hot stamping foils';

  return (
    <>
      <SEOMeta
        title={pageTitle}
        description={pageDesc}
        keywords={lang === 'cn'
          ? ['烫金膜', '烫金箔', '博客', '行业资讯', '技术文章', '包装印刷', '烫金技术', '东莞', '烫金箔生产工艺', '冷烫箔使用方法', '全息烫金膜应用案例', '包装印刷烫金技术教程', '东莞烫金箔行业动态', '品特PINTE烫金技术干货', '东南亚烫金箔市场分析', '烫金箔常见问题解答', '电化铝选购指南']
          : ['blog', 'hot stamping foil', 'technical articles', 'industry news', 'packaging', 'printing', 'manufacturing', 'hot stamping foil production process', 'cold foil application guide', 'holographic foil case studies', 'hot stamping foil troubleshooting', 'Southeast Asia hot stamping foil market trends', 'PINTE hot stamping foil technical tips', 'how to choose hot stamping foil for packaging']
        }
        url={`/${lang}/blog`}
        type="website"
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={`/${lang}/blog`}
      />
      
      {/* JSON-LD Structure Data */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <main className="min-h-screen bg-neutral-50 pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-neutral-900 mb-6">
              {pageTitle}
            </h1>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
              {pageDesc}
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 mb-12">
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'cn' ? '搜索文章...' : 'Search articles...'}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-pinte-blue focus:ring-2 focus:ring-pinte-blue/20 outline-none transition-all"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-neutral-200 focus:border-pinte-blue outline-none bg-white"
              >
                <option value="all">{lang === 'cn' ? '所有分类' : 'All Categories'}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-3 rounded-xl border border-neutral-200 focus:border-pinte-blue outline-none bg-white"
              >
                <option value="all">{lang === 'cn' ? '所有地区' : 'All Regions'}</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-pinte-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-pinte-dark transition-colors flex items-center gap-2"
              >
                <Search size={18} />
                {lang === 'cn' ? '搜索' : 'Search'}
              </button>
            </form>

            {/* Active Filters */}
            {(selectedCategory !== 'all' || selectedRegion !== 'all' || searchQuery) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-100">
                <span className="text-sm text-neutral-500">
                  {lang === 'cn' ? '当前筛选:' : 'Active filters:'} 
                </span>
                {searchQuery && (
                  <span className="px-3 py-1 bg-pinte-blue/10 text-pinte-blue text-sm rounded-full flex items-center gap-1">
                    "{searchQuery}"
                    <button onClick={() => { setSearchQuery(''); handleSearch(new Event('submit') as any); }}>
                      <ChevronRight size={14} className="rotate-90" />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full flex items-center gap-1">
                    {selectedCategory}
                    <button onClick={() => { setSelectedCategory('all'); handleSearch(new Event('submit') as any); }}>
                      <ChevronRight size={14} className="rotate-90" />
                    </button>
                  </span>
                )}
                {selectedRegion !== 'all' && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full flex items-center gap-1">
                    {selectedRegion}
                    <button onClick={() => { setSelectedRegion('all'); handleSearch(new Event('submit') as any); }}>
                      <ChevronRight size={14} className="rotate-90" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-8 flex items-center justify-between">
            <p className="text-neutral-500">
              {lang === 'cn' 
                ? `找到 ${filteredArticles.length} 篇文章`
                : `Found ${filteredArticles.length} articles`
              }
            </p>
          </div>

          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <article 
                  key={article.id} 
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-neutral-100"
                >
                  {/* Cover Image */}
                  <Link to={`/${lang}/blog/${article.slug}`} className="block relative h-48 overflow-hidden">
                    <img
                      src={article.cover || 'https://pintepic-1300269931.cos.ap-singapore.myqcloud.com/blog-default.jpg'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Category Badge */}
                    {article.category?.[0] && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-neutral-900 rounded-full">
                        {article.category[0]}
                      </span>
                    )}
                    {/* GEO Badge */}
                    {article.geo?.region && (
                      <span className="absolute top-4 right-4 px-2 py-1 bg-pinte-blue text-white text-xs font-bold rounded-full">
                        📍 {article.geo.region}
                      </span>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-6">
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-neutral-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(article.date)}
                      </span>
                      {article.author && (
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {article.author}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link to={`/${lang}/blog/${article.slug}`}>
                      <h2 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-pinte-blue transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                    </Link>

                    {/* Summary */}
                    <p className="text-neutral-500 text-sm leading-relaxed mb-4 line-clamp-3">
                      {article.summary}
                    </p>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-neutral-100 text-neutral-500 text-xs rounded-md">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Read More */}
                    <Link
                      to={`/${lang}/blog/${article.slug}`}
                      className="inline-flex items-center gap-2 text-pinte-blue font-bold text-sm group/btn"
                    >
                      {lang === 'cn' ? '阅读全文' : 'Read More'}
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                {lang === 'cn' ? '没有找到相关文章' : 'No articles found'}
              </h3>
              <p className="text-neutral-500 mb-6">
                {lang === 'cn' ? '请尝试其他关键词或筛选条件' : 'Try different keywords or filters'}
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedRegion('all'); }}
                className="text-pinte-blue font-bold hover:underline"
              >
                {lang === 'cn' ? '清除所有筛选' : 'Clear all filters'}
              </button>
            </div>
          )}

          {/* SEO Section - 站内链接 */}
          <div className="mt-20 bg-white rounded-3xl p-8 border border-neutral-100">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">
              {lang === 'cn' ? '热门标签' : 'Popular Tags'}
            </h3>
            <div className="flex flex-wrap gap-3">
              {['Hot Stamping Foil', '烫金膜', '包装设计', '印刷技术', '品牌营销', 'SEO', 'GEO'].map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?search=${encodeURIComponent(tag)}`}
                  className="px-4 py-2 bg-neutral-50 hover:bg-pinte-blue hover:text-white rounded-full text-sm font-medium transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default BlogCatalog;
