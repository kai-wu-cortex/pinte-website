export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let path = url.pathname;

    // If the path doesn't have a file extension and doesn't end with /,
    // check if it's a directory with an index.html file
    if (!path.includes('.') && !path.endsWith('/')) {
      // Try to serve /path/index.html
      const indexUrl = new URL(request.url);
      indexUrl.pathname = `${path}/index.html`;

      try {
        const response = await env.ASSETS.fetch(new Request(indexUrl));
        if (response.ok) {
          return response;
        }
      } catch (e) {
        // Fall through to original handling
      }
    }

    // If the path ends with /, try index.html
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

    // Fall back to default assets handling
    return env.ASSETS.fetch(request);
  },
};
