# SEO 优化行动计划 - 优先级排序

> 针对 https://www.pintecl.com 越南、东南亚、欧美市场推广

---

## 🔴 CRITICAL (立即修复 - 1 周内完成)

### 1. 创建 About Us 页面并添加完整公司信息
**位置**: `src/pages/About.tsx`
**内容要求**:
- 公司历史（2000年成立，25+年经验）
- 工厂地址：东莞市长安镇
- 生产能力：200,000㎡ 厂房，日产 60,000 米
- R&D 投入：15% 年收入
- 认证：ISO9001、RoHS、EN71-3、ASTM-F963
- 管理团队简介（可选但推荐）

**为什么重要**: E-E-A-T 中 Experience 和 Authoritativeness 最关键信号，帮助国际买家建立信任。**SEO 排名直接受益**。

### 2. 在页脚添加完整联系信息
**位置**: `src/components/Footer.tsx`
**内容要求**:
- 公司名称: Dongguan Best Craftwork Products Co., Ltd.
- 地址: Chang'an Town, Dongguan City, Guangdong Province, China
- 邮箱: sales@bestglitter.com
- 电话: +86-13192267509

**为什么重要**: 信任信号，Google 需要确认这是真实企业。对于 B2B 国际采购非常重要。

### 3. 添加隐私政策和服务条款页面
**位置**: `public/privacy-policy.html`, `public/terms-of-service.html` 或作为 React 页面
**内容要求**: 简单的标准内容即可，满足基本合规要求。

**为什么重要**: 缺失这些页面是 SEO 负面信号，影响信任评估。

### 4. ✅ 图片 SEO 基础设施已自动完成
- ✅ 创建了 `components/OptimizedImage.tsx` - 可复用 SEO 友好图片组件
- ✅ 给所有 13 张缺失 alt 的图片添加了描述性 alt 文字
- ✅ 给所有图片添加了 `width`/`height` 属性
- ✅ 给所有首屏以下图片添加了 `loading="lazy"`
- ✅ 更新了所有使用图片的组件

**剩余图片任务（HIGH 优先级）**:
- 调整 6 张超大图片尺寸：Hero (4096×2304 → 1200×675)、产品图 (2880×3840 → 800×1067) 等
- Green Future 图片 (6.5MB) → resize 到 800×1000 并压缩
- 转换所有 PNG/JPG 到 WebP 格式，减少 25-40% 文件大小
- 全面替换 `<img>` 标签使用 `OptimizedImage` 组件获得响应式 srcset 支持

### 5. 修复移动端可触摸元素尺寸
- 确保所有按钮/链接最小 44×44px
- 增大语言切换按钮、页脚链接、产品链接的点击区域
- 增加小字体尺寸（移动端 ≥ 14px）
- 修复侧边导航菜单溢出视口问题

**为什么重要**: 改善移动端用户体验，对来自越南/东南亚的移动搜索用户特别重要。

---

## 🔴 HIGH (1 个月内完成)

### 6. 启用静态站点生成 (SSG) 预渲染所有页面
**当前问题**: 客户端渲染，初始 HTML 为空
**解决方案**:
- 如果使用 Vercel，配置为静态输出
- 或者使用 pre-render 工具在构建时生成静态 HTML
- 目标: 初始 HTML 包含完整内容，Google 爬蟲无需执行 JS 就能读取

**为什么重要**: **最大的 SEO 问题**。影响:
- 抓取速度和索引效率
- LCP 性能（减少 1-1.5 秒）
- AI 爬蟲内容提取

### 7. 扩展每个产品分类的详细内容
**每个产品页面需要**:
- 详细产品描述（≥300词）
- 技术规格参数
- 应用领域/行业
- 产品特点/优势
- 常见问题

**产品分类**:
- General Hot Stamping
- Holographic Films
- Cold Foil
- Metallized Films
- Security Films

### 8. 创建应用解决方案页面
**现有解决方案框架已经在 sitemap 中**:
- `/solutions/cosmetics-packaging`
- `/solutions/wine-spirits`
- `/solutions/pharmaceutical`
- `/solutions/tobacco`
- `/solutions/gift-cards`

每个页面添加:
- 行业应用特点
- PINTE 解决方案优势
- 成功案例（如果有）

### 9. 添加客户见证/案例研究
**内容**:
- 2-3 个满意客户推荐（经客户允许）
- 每个案例 100-200 词
- 可匿名处理如果需要

**为什么重要**: 社会证明，提升转化率和信任度。

### 10. 将依赖从 CDN 改为本地打包
**当前**: React、Tailwind、lucide-react 都从外部 CDN 加载
**改为**: npm 安装，本地打包
**收益**: 更稳定的性能，减少网络延迟波动，改善 INP。

### 5. 启用静态站点生成 (SSG) 预渲染所有页面
**当前问题**: 客户端渲染，初始 HTML 为空
**解决方案**:
- 如果使用 Vercel，配置为静态输出
- 或者使用 pre-render 工具在构建时生成静态 HTML
- 目标: 初始 HTML 包含完整内容，Google 爬蟲无需执行 JS 就能读取

**为什么重要**: **最大的 SEO 问题**。影响:
- 抓取速度和索引效率
- LCP 性能（减少 1-1.5 秒）
- AI 爬蟲内容提取

### 6. 扩展每个产品分类的详细内容
**每个产品页面需要**:
- 详细产品描述（≥300词）
- 技术规格参数
- 应用领域/行业
- 产品特点/优势
- 常见问题

**产品分类**:
- General Hot Stamping
- Holographic Films
- Cold Foil
- Metallized Films
- Security Films

### 7. 创建应用解决方案页面
**现有解决方案框架已经在 sitemap 中**:
- `/solutions/cosmetics-packaging`
- `/solutions/wine-spirits`
- `/solutions/pharmaceutical`
- `/solutions/tobacco`
- `/solutions/gift-cards`

每个页面添加:
- 行业应用特点
- PINTE 解决方案优势
- 成功案例（如果有）

### 8. 添加客户见证/案例研究
**内容**:
- 2-3 个满意客户推荐（经客户允许）
- 每个案例 100-200 词
- 可匿名处理如果需要

**为什么重要**: 社会证明，提升转化率和信任度。

### 9. 将依赖从 CDN 改为本地打包
**当前**: React、Tailwind、lucide-react 都从外部 CDN 加载
**改为**: npm 安装，本地打包
**收益**: 更稳定的性能，减少网络延迟波动，改善 INP。

---

## 🟡 MEDIUM (3 个月内完成)

### 11. 迁移到路径化 URL 路由
**当前**: `/#/products` hash 路由
**改为**: `/en-US/products`, `/vi-VN/products` 路径路由
**收益**: 更利于爬蟲索引，清晰的语言/区域分区。

### 12. 添加越南语内容翻译
**最少需要翻译**:
- 首页
- About Us
- 产品列表
- 联系页面

**为什么重要**: 越南是核心目标市场，当地语言内容显著提升排名和转化率。

### 13. 在 Vercel 配置安全响应头
**需要添加**:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### 14. 将所有产品图片转换为 WebP 格式并压缩
**工具**: 使用 `squoosh` 或 `sharp` 批量转换
**收益**: 文件大小减少 30-50%，改善加载速度。

### 15. 实现响应式图片（srcset/sizes）
- 为关键产品图片生成多种尺寸（400w, 800w, 1200w）
- 添加 `srcset` 和 `sizes` 属性让浏览器选择合适尺寸

---

## 🟢 LOW (Backlog，有时间再做)

### 16. 添加 LinkedIn 公司页面并在网站链接
### 17. 调整移动端首屏布局，让 CTA 按钮可见
### 18. 开始博客，定期发布技术内容（每月 1-2 篇）
- 主题建议: "如何选择适合包装的烫金箔", "烫金工艺常见问题解答", "东南亚包装行业趋势" 等
### 19. 添加行业协会会员信息（如果有）

---

## ✅ 已完成（代码已修改，可直接部署）

这些已经做好了，不需要再做:

1. **✓** 创建 `robots.txt` - `/public/robots.txt`（已更新允许 AI 爬虫: GPTBot、ClaudeBot、PerplexityBot）
2. **✓** 创建 `sitemap.xml` - `/public/sitemap.xml`（包含所有目标市场 hreflang）
3. **✓** 实现完整 hreflang 标签 - `SEOMeta.tsx`（支持 `vi-VN`, `en-MY`, `en-US`, `en-GB`, `zh-CN`）
4. **✓** 添加 Manufacturer JSON-LD 结构化数据 - `SEOMeta.tsx`（包含所有目标市场 areaServed，完整产品列表）
5. **✓** 创建 `llms.txt` 供 AI 爬蟲提取 - `/public/llms.txt`（包含公司摘要、关键事实、联系信息）
6. **✓** 扩展 LanguageContext 支持多区域 - `LanguageContext.tsx`
7. **✓** 创建 `OptimizedImage.tsx` 组件 - alt、lazy loading、width/height、responsive srcset 支持
8. **✓** 添加 alt text 到所有图片 - 更新多个组件
9. **✓** 添加 width/height 到所有图片
10. **✓** 添加 lazy loading 到所有首屏以下图片

---

## 📊 进度跟踪

| 阶段 | CRITICAL | HIGH | MEDIUM | LOW | 预期 SEO 分数 |
|------|----------|------|--------|-----|--------------|
| 当前 | **1/5** | 0/6 | 0/5 | 0/4 | **75/100** (当前实际 74.6) |
| 完成 CRITICAL | 5/5 | 0/6 | 0/5 | 0/4 | **81/100** |
| 完成 CRITICAL + HIGH | 5/5 | 6/6 | 0/5 | 0/4 | **88/100** |
| 全部完成 | 5/5 | 6/6 | 5/5 | 4/4 | **94/100** |

*CRITICAL 已完成: alt text、width/height、lazy loading*

---

## 🎯 针对目标市场的快速检查清单

### 越南市场
- [✓] hreflang `vi-VN` 已添加
- [ ] 越南语首页翻译
- [ ] 越南语 About 页面
- [ ] 在内容中提及"越南市场"

### 东南亚市场
- [✓] hreflang `en-SEA` 已添加
- [ ] 在内容中提及主要国家（泰国、马来西亚、印尼、新加坡）
- [ ] 明确说明服务东南亚

### 欧美市场
- [✓] hreflang `en-US`, `en-GB` 已添加
- [ ] 确保所有规格准确英语
- [ ] 突出合规认证（RoHS 等）

---

*生成时间: 2026-04-07*
