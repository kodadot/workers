import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { Env, CACHE_MONTH, CACHE_TTL_BY_STATUS } from './utils/constants';
import { uploadToCloudflareImages } from './utils/cloudflare-images';

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => c.text('Hello! cf-workers!'));

app.use('/ipfs/*', cors());

app.all('/ipfs/:cid', async (c) => {
  const cid = c.req.param('cid');
  const method = c.req.method;

  const request = c.req;
  const cacheUrl = new URL(request.url);
  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = caches.default;

  let response = await cache.match(cacheKey);

  console.log('response', response);

  if (method === 'GET') {
    const objectName = `ipfs/${cid}`;
    const object = await c.env.MY_BUCKET.get(objectName);

    // if r2 object not exists, fetch from ipfs gateway
    if (object === null) {
      const fetchIPFS = await Promise.any([
        fetch(`${c.env.DEDICATED_GATEWAY}/ipfs/${cid}`),
        fetch(`${c.env.DEDICATED_BACKUP_GATEWAY}/ipfs/${cid}`),
      ]);
      const statusCode = fetchIPFS.status;

      if (statusCode === 200) {
        // put object to r2
        await c.env.MY_BUCKET.put(objectName, fetchIPFS.body, {
          httpMetadata: fetchIPFS.headers,
        });

        // put object to cf-images
        const imageUrl = await uploadToCloudflareImages({
          cid,
          token: c.env.IMAGE_API_TOKEN,
          gateway: c.env.DEDICATED_GATEWAY,
          imageAccount: c.env.CF_IMAGE_ACCOUNT,
          imageId: c.env.CF_IMAGE_ID,
        });

        if (imageUrl) {
          return Response.redirect(imageUrl, 302);
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
      return Response.redirect(`${c.env.CLOUDFLARE_GATEWAY}/ipfs/${cid}`, 302);
    }

    if (!response) {
      const cfImage = `https://imagedelivery.net/${c.env.CF_IMAGE_ID}/${cid}/public`;
      const currentImage = await fetch(cfImage, {
        method: 'HEAD',
        cf: CACHE_TTL_BY_STATUS,
      });

      // return early to cf-images
      if (currentImage.ok) {
        return Response.redirect(cfImage, 302);
      }

      // else, upload to cf-images
      const imageUrl = await uploadToCloudflareImages({
        cid,
        token: c.env.IMAGE_API_TOKEN,
        gateway: c.env.DEDICATED_GATEWAY,
        imageAccount: c.env.CF_IMAGE_ACCOUNT,
        imageId: c.env.CF_IMAGE_ID,
      });

      // redirect to cf-images
      if (imageUrl) {
        // how to cache redirect response?
        return Response.redirect(imageUrl, 302);
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
    const objectName = `ipfs/${cid}`;
    const object = await c.env.MY_BUCKET.get(objectName);

    if (object === null) {
      const fetchIPFS = await Promise.any([
        fetch(`${c.env.DEDICATED_GATEWAY}/ipfs/${cid}`),
        fetch(`${c.env.DEDICATED_BACKUP_GATEWAY}/ipfs/${cid}`),
      ]);
      const statusCode = fetchIPFS.status;

      if (statusCode === 200) {
        return c.body(fetchIPFS.body);
      }

      // fallback to cf-ipfs
      return Response.redirect(`${c.env.CLOUDFLARE_GATEWAY}/ipfs/${cid}`, 302);
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
