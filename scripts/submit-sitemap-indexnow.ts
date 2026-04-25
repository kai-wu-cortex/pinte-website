/**
 * IndexNow 批量URL提交脚本
 * 从 sitemap.xml 读取所有URL，批量提交到 IndexNow API
 * 文档: https://www.indexnow.org/documentation
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const INDEXNOW_KEY = '5f118c2cfc2b4fa5946dcfd5008bbd01';
const HOST = 'www.pintecl.com';
const SITEMAP_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

async function extractUrlsFromSitemap(): Promise<string[]> {
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  // Extract all <loc> tags content
  const locRegex = /<loc>([^<]+)<\/loc>/g;
  const urls: string[] = [];
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }
  return urls;
}

async function submitToIndexNow(urls: string[]): Promise<void> {
  console.log(`🚀 Submitting ${urls.length} URLs to IndexNow...`);
  console.log(`🔑 Key: ${INDEXNOW_KEY}`);
  console.log(`📍 Key location: ${KEY_LOCATION}`);
  console.log(`🌐 Host: ${HOST}`);
  console.log();

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  try {
    const response = await fetch('https://api.indexnow.org', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (response.status === 200) {
      console.log('\n✅ Success! All URLs submitted successfully.');
      console.log('   Bing will crawl these URLs soon for faster indexing.');
    } else if (response.status === 400) {
      console.log('\n❌ Error 400: Bad request - Invalid format');
    } else if (response.status === 403) {
      console.log('\n❌ Error 403: Forbidden - Key not valid (check if key file is accessible)');
    } else if (response.status === 422) {
      console.log('\n❌ Error 422: Unprocessable Entity - URLs don\\'t belong to this host or key invalid');
    } else if (response.status === 429) {
      console.log('\n❌ Error 429: Too Many Requests - Rate limited');
    }

    const text = await response.text();
    if (text) {
      console.log(`\n📄 Response: ${text}`);
    }
  } catch (error) {
    console.error('\n💥 Network error:', error);
    process.exit(1);
  }
}

async function main() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error(`❌ Sitemap not found at ${SITEMAP_PATH}`);
    console.error('   Make sure you have built the project and sitemap.xml is in public/');
    process.exit(1);
  }

  const urls = await extractUrlsFromSitemap();
  console.log(`📋 Found ${urls.length} URLs in sitemap.xml`);
  console.log();

  if (urls.length === 0) {
    console.error('❌ No URLs found in sitemap');
    process.exit(1);
  }

  await submitToIndexNow(urls);
}

main().catch(console.error);
