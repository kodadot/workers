import type { Context } from 'hono';
import { CACHE_TTL_BY_STATUS, type Env } from '../utils/constants';
import { urlToCFI } from '../utils/cloudflare-images';

type HonoInterface = Context<
  {
    Bindings: Env;
  },
  '/type/url',
  {}
>;

export const trimEndpoint = (endpoint: string) => {
  return endpoint.replace(/[:,._/]/g, '-');
};

export const getTypeUrl = async (c: HonoInterface) => {
  const { endpoint } = c.req.query();
  const path = trimEndpoint(endpoint);

  // 1. check existing image on cf-images
  // ----------------------------------------
  const cfImage = `https://imagedelivery.net/${c.env.CF_IMAGE_ID}/${path}/public`;
  const currentImage = await fetch(cfImage, {
    method: 'HEAD',
    cf: CACHE_TTL_BY_STATUS,
  });

  if (currentImage.ok) {
    return c.redirect(cfImage, 302);
  }

  // 2. check existing object in r2 bucket
  // ----------------------------------------
  const objectName = `type-url/${path}`;
  const object = await c.env.MY_BUCKET.get(objectName);

  if (object !== null) {
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('etag', object.httpEtag);

    return new Response(object.body, {
      headers,
    });
  }

  // 3. upload image to cf-images
  // ----------------------------------------
  const imageUrl = await urlToCFI({
    endpoint,
    token: c.env.IMAGE_API_TOKEN,
    imageAccount: c.env.CF_IMAGE_ACCOUNT,
  });

  if (imageUrl) {
    return c.redirect(imageUrl, 302);
  }

  // 4. upload to r2 bucket
  // ----------------------------------------
  const fetchObject = await fetch(endpoint, { cf: CACHE_TTL_BY_STATUS });
  const statusCode = fetchObject.status;

  if (statusCode === 200) {
    await c.env.MY_BUCKET.put(objectName, fetchObject.body, {
      httpMetadata: fetchObject.headers,
    });

    const newObject = await c.env.MY_BUCKET.get(objectName);

    if (newObject !== null) {
      const headers = new Headers();
      newObject.writeHttpMetadata(headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('etag', newObject.httpEtag);

      return new Response(newObject.body, {
        headers,
      });
    }
  }

  // 5. if all else fails, redirect to original endpoint
  // ----------------------------------------
  return c.redirect(endpoint, 302);
};
