# EdgeOne 部署指南

## 项目结构

```
pinte-website-edgeone/
├── api/
│   └── notion.js          # 云函数 - Notion API 代理
├── src/                   # 前端源码
├── dist/                  # 构建输出
├── prerender.ts          # 预渲染插件 - 生成静态 SEO 页面
├── .env.production        # 生产环境变量
└── package.json
```

## 部署步骤

### 1. 构建前端（带 SEO）

```bash
cd pinte-website-edgeone

# 设置环境变量
export NOTION_API_KEY=你的NotionAPIKey
export NOTION_DATABASE_ID=你的数据库ID

# 构建并生成 SEO 静态页面
npm run build:seo
```

这会：
1. 构建前端资源到 `dist/`
2. 自动从 Notion 获取所有文章
3. 为每篇文章生成静态 HTML（如 `/blog/xxx.html`）

### 2. 配置 EdgeOne 云函数

在 EdgeOne 控制台：

1. **创建云函数**
   - 名称: `notion-api`
   - 入口: `api/notion.js`
   - 运行环境: Node.js

2. **配置环境变量**
   - `NOTION_API_KEY`: 你的 Notion API Key
   - `NOTION_DATABASE_ID`: 你的数据库 ID

3. **配置触发器**
   - 路径: `/api/notion/*`
   - 方法: GET, POST, OPTIONS

### 3. 部署静态文件

将 `dist/` 目录的文件部署到 EdgeOne 静态站点。

## SEO 优化

### 预渲染 (Prerender)

项目已配置预渲染功能，构建时会自动：

1. 📥 从 Notion 获取所有文章
2. 📄 为每篇文章生成静态 HTML
3. 🏷️ 自动添加 Meta 标签（title, description, og:image）
4. 📚 生成站点地图

### 生成的文件

```
dist/
├── index.html                    # 首页
├── blog/
│   ├── index.html               # 博客列表页
│   ├── 30cf8285a7fd...html     # 文章静态页面
│   ├── 30cf8285a7fd...html
│   └── ...
└── assets/
```

### 搜索引擎优化

- ✅ 静态 HTML - 搜索引擎可直接抓取
- ✅ Meta 标签 - 社交分享优化
- ✅ 语义化 HTML - 更好的索引
- ⚡ 快速加载 - 静态文件加载更快

## 更新内容

每次在 Notion 中更新文章后，需要重新构建：

```bash
npm run build:seo
```

### 自动部署（推荐）

可以配置 GitHub Actions 或 EdgeOne 的 CI/CD 自动构建：

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
  schedule:
    # 每天自动构建
    - cron: '0 0 * * *'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build:seo
        env:
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
          NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
      # 部署到 EdgeOne...
```

## 本地测试

```bash
# 启动开发服务器
npm run dev

# 测试预渲染
export NOTION_API_KEY=你的Key
export NOTION_DATABASE_ID=你的ID
npm run prerender
```

## 注意事项

1. **API Key 安全**: 云函数保护了你的 Notion API Key，不会暴露在浏览器端
2. **CORS**: 云函数已配置 CORS 头，允许跨域请求
3. **缓存**: 可以在云函数中添加缓存逻辑减少 API 调用
4. **SEO**: 预渲染需要在构建时能访问 Notion API
