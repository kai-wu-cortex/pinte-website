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
          // Return the index.html content
          return new Response(response.body, {
            status: 200,
            headers: {
              ...Object.fromEntries(response.headers),
              'Cache-Control': 'public, max-age=60',
            },
          });
        }
      } catch (e) {
        // If index.html not found, fall through to original request
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
