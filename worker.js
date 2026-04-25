export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // If the path doesn't end with slash and doesn't have a file extension
    // and it's not already trying to serve index.html, try adding /index.html
    if (!path.endsWith('/') && !path.includes('.') && !path.endsWith('index.html')) {
      const indexUrl = new URL(request.url);
      indexUrl.pathname = `${path}/index.html`;
      // Try to get the index.html asset
      try {
        const response = await env.ASSETS.fetch(new Request(indexUrl));
        if (response.ok) {
          // Just return the response as-is
          return response;
        }
      } catch (e) {
        // If index.html not found, fall through to original request
        console.error('index.html not found', e);
      }
    }

    // Handle trailing slash - also serve index.html
    if (path.endsWith('/')) {
      const indexUrl = new URL(request.url);
      indexUrl.pathname = `${path}index.html`;
      try {
        const response = await env.ASSETS.fetch(new Request(indexUrl));
        if (response.ok) {
          return response;
        }
      } catch (e) {
        // Fall through
      }
    }

    // Default handling for everything else
    return env.ASSETS.fetch(request);
  },
};
