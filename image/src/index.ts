import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { Env, CACHE_MONTH, CACHE_TTL_BY_STATUS } from './utils/constants';
import { uploadToCloudflareImages } from './utils/cloudflare-images';
import { allowedOrigin } from './utils/cors';
import { fetchIPFS } from './utils/ipfs';

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => c.text('Hello! cf-workers!'));

app.use('/ipfs/*', cors({ origin: allowedOrigin }));

app.all('/ipfs/*', async (c) => {
  const method = c.req.method;
  const { original } = c.req.query();
  const isOriginal = original === 'true';

  const url = new URL(c.req.url);
  const path = url.pathname.replace('/ipfs/', '');

  // add trailing slash
  if (!url.pathname.endsWith('/') && url.search) {
    return c.redirect(`${url.pathname}/${url.search}`, 301);
  }

  const fullPath = `${path}${url.search}`;
  // const encodePath = encodeURIComponent(fullPath);

  const request = c.req;
  const flushCache = '2023-04-15-a'; // change the value to flush the cache
  const cacheUrl = new URL(request.url);
  const cacheKey = new Request(cacheUrl.toString() + flushCache, request);
  const cache = caches.default;

  let response = await cache.match(cacheKey);

  console.log('response', response);

  if (method === 'GET') {
    const objectName = `ipfs/${path}`;
    const object = await c.env.MY_BUCKET.get(objectName);

    // if r2 object not exists, fetch from ipfs gateway
    if (object === null) {
      const status = await fetchIPFS({
        path: fullPath,
        gateway1: c.env.DEDICATED_GATEWAY,
        gateway2: c.env.DEDICATED_BACKUP_GATEWAY,
      });

      if (status.ok && status.response?.body && status.response?.headers) {
        // put object to r2
        await c.env.MY_BUCKET.put(objectName, status.response.body, {
          httpMetadata: status.response.headers,
        });

        // put object to cf-images
        const imageUrl = await uploadToCloudflareImages({
          path,
          token: c.env.IMAGE_API_TOKEN,
          gateway: c.env.DEDICATED_GATEWAY,
          imageAccount: c.env.CF_IMAGE_ACCOUNT,
          imageId: c.env.CF_IMAGE_ID,
        });

        if (imageUrl && !isOriginal) {
          return c.redirect(imageUrl, 302);
        }

        // else, render r2 object
        const r2Object = await c.env.MY_BUCKET.get(objectName);
        if (r2Object !== null) {
          const headers = new Headers();
          r2Object.writeHttpMetadata(headers);
          headers.set('Access-Control-Allow-Origin', '*');
          headers.set('etag', r2Object.httpEtag);

          return new Response(r2Object.body, {
            headers,
          });
        }
      }

      // fallback to cf-ipfs
      return c.redirect(`${c.env.CLOUDFLARE_GATEWAY}/ipfs/${path}`, 302);
    }

    if (!response) {
      if (!isOriginal) {
        const cfImage = `https://imagedelivery.net/${c.env.CF_IMAGE_ID}/${path}/public`;
        const currentImage = await fetch(cfImage, {
          method: 'HEAD',
          cf: CACHE_TTL_BY_STATUS,
        });

        // return early to cf-images
        if (currentImage.ok) {
          return c.redirect(cfImage, 302);
        }

        // else, upload to cf-images
        const imageUrl = await uploadToCloudflareImages({
          path,
          token: c.env.IMAGE_API_TOKEN,
          gateway: c.env.DEDICATED_GATEWAY,
          imageAccount: c.env.CF_IMAGE_ACCOUNT,
          imageId: c.env.CF_IMAGE_ID,
        });

        // redirect to cf-images
        if (imageUrl) {
          // how to cache redirect response?
          return c.redirect(imageUrl, 302);
        }
      }

      // else, render r2 object and cache it
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('etag', object.httpEtag);

      response = new Response(object.body, {
        headers,
      });

      response.headers.append('Cache-Control', `s-maxage=${CACHE_MONTH}`);
      c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  }

  if (method === 'HEAD') {
    const objectName = `ipfs/${path}`;
    const object = await c.env.MY_BUCKET.get(objectName);

    if (object === null) {
      const status = await fetchIPFS({
        path: fullPath,
        gateway1: c.env.DEDICATED_GATEWAY,
        gateway2: c.env.DEDICATED_BACKUP_GATEWAY,
      });

      if (status.ok && status.response?.body) {
        return c.body(status.response.body);
      }

      // fallback to cf-ipfs
      return c.redirect(`${c.env.CLOUDFLARE_GATEWAY}/ipfs/${path}`, 302);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('etag', object.httpEtag);

    return new Response(object.body, {
      headers,
    });
  }
});

export default app;
