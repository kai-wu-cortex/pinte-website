# Notion 博客同步指南

## 概述

本功能允许你通过 Notion 数据库管理博客文章，自动同步到网站，支持 SEO/SEM/GEO 优化。

---

## 第一步：创建 Notion Integration

1. 访问 [Notion My Integrations](https://www.notion.so/my-integrations)
2. 点击 **"New integration"**
3. 填写名称（如：PINTE Blog）
4. 选择工作空间
5. 获取 **Internal Integration Token**（格式：`secret_xxxx...`）

---

## 第二步：创建博客数据库

1. 在 Notion 中创建一个新的数据库（Database）
2. 添加以下属性（Properties）：

| 属性名 | 类型 | 说明 | SEO相关 |
|--------|------|------|---------|
| Name / Title | Title | 文章标题 | ✓ |
| Summary / Description | Text | 文章摘要 | ✓ |
| Cover | Files & Media | 封面图片 | ✓ |
| Date | Date | 发布日期 | ✓ |
| Author | Text | 作者 | |
| Category | Multi-select | 分类 | ✓ |
| Tags | Multi-select | 标签 | ✓ |
| Status | Select | 状态 (Published/Draft) | |
| Slug | Text | URL别名 (如: my-article) | ✓ |
| SEO_Title | Text | SEO标题 | ✓ |
| SEO_Description | Text | SEO描述 | ✓ |
| SEO_Keywords | Multi-select | SEO关键词 | ✓ |
| OG_Image | Files & Media | 社交分享图 | ✓ |
| GEO_Region | Select | 目标地区 (如: China, USA, Global) | ✓ |
| GEO_Language | Select | 语言 (如: en_US, zh_CN) | ✓ |
| GEO_Locality | Text | 城市/地点 | ✓ |

3. **重要**：点击数据库右上角的 `...` → `Connections` → 添加你的 Integration

---

## 第三步：配置环境变量

编辑 `.env.local` 文件：

```bash
# Notion 配置
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=你的数据库ID（URL中 ? 后面的32位字符串）

# 网站URL（用于SEO）
SITE_URL=https://pinte.com
```

**获取 Database ID**：
- URL 格式：`https://notion.so/workspace/Database-Name-DatabaseID?v=...`
- Database ID 是 32 位字符，如：`1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`

---

## 第四步：同步博客

### 开发模式
```bash
npm run sync-blog
```

### 构建时自动同步
```bash
npm run build:with-blog
```

---

## 第五步：在 Notion 中写博客

1. 在数据库中新建页面
2. 填写标题、内容
3. 设置 Category、Tags、GEO 信息
4. 将 Status 设为 **Published**
5. 运行同步命令

---

## SEO/SEM/GEO 功能

### SEO 优化
- ✅ Meta 标题、描述、关键词
- ✅ Open Graph 社交分享卡片
- ✅ Twitter Card
- ✅ Canonical URL
- ✅ 结构化数据 (JSON-LD)

### SEM 优化
- ✅ 文章结构化数据 (Article Schema)
- ✅ Breadcrumb 导航结构
- ✅ Website 搜索动作结构

### GEO 定位优化
- ✅ `geo.region` Meta 标签
- ✅ `geo.placename` Meta 标签
- ✅ 多语言支持 (en_US, zh_CN, etc.)
- ✅ 区域内容标签

---

## 文件结构

```
pinte-website/
├── public/
│   └── blog/
│       ├── article-slug.json    # 每篇文章的静态数据
│       ├── sitemap-blog.json    # 博客 sitemap
│       └── blog-seo-report.json # SEO 报告
├── src/
│   ├── data/
│   │   └── blog.json            # 博客列表数据
│   ├── pages/
│   │   ├── BlogCatalog.tsx      # 博客列表页
│   │   └── BlogItem.tsx        # 博客详情页
│   └── components/
│       └── SEOMeta.tsx          # SEO 组件
├── scripts/
│   └── fetch-blog.js            # 同步脚本
└── .env.local                   # 环境配置
```

---

## 常见问题

### Q: 同步时报错 "Unauthorized"
A: 确保已在数据库中添加 Integration 连接（右上角 ... → Connections）

### Q: 文章没有显示
A: 检查 Status 字段是否为 "Published"

### Q: 内容为空
A: 确保文章页面有实际内容块（Notion 页面内容）

### Q: 图片不显示
A: 确保图片已上传到 Notion 或使用外部链接
