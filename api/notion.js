/**
 * EdgeOne 云函数 - Notion API 代理
 * 用于解决跨域和保护 API Key
 */

export default async function handler(request) {
  // 设置 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Notion-Version, Content-Type',
  };

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // 从环境变量获取 Notion API Key
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

  if (!NOTION_API_KEY) {
    return new Response(JSON.stringify({ error: 'Notion API Key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 获取请求路径（去掉 /api/notion 前缀）
  let path = request.url.replace(/^.*\/api\/notion/, '');
  if (!path) path = '/v1';

  // 构建 Notion API 请求
  const notionUrl = `https://api.notion.com/v1${path}`;

  const response = await fetch(notionUrl, {
    method: request.method,
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2025-09-03',
      'Content-Type': 'application/json',
    },
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
  });

  // 返回响应
  const data = await response.text();
  return new Response(data, {
    status: response.status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
