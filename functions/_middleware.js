export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Skip for static assets
  if (pathname.match(/\.(html|css|js|png|jpg|jpeg|webp|svg|ico|txt|xml|json)$/i)) {
    return context.next();
  }

  // For /cn/*, /en/*, and embeddable widget paths, try to serve the file first
  // If 404, return index.html for React Router
  if (pathname.startsWith('/cn/') || pathname.startsWith('/en/') || pathname.startsWith('/embed/')) {
    try {
      const response = await context.next();
      if (response.status === 404) {
        // Return index.html - React Router will handle the routing
        return context.env.ASSETS.fetch(url.origin + '/index.html');
      }
      return response;
    } catch (e) {
      return context.env.ASSETS.fetch(url.origin + '/index.html');
    }
  }

  return context.next();
}
