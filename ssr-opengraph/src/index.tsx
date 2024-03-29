import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import isbot from 'isbot';

import { Opengraph } from './template';
import { userDetail } from './handlers';
import { ogiRequest } from './utils';

const app = new Hono();

const chains = ['rmrk', 'ksm', 'ahp', 'ahk'];

app.get('/', async (c) => {
  const useragent = c.req.header('User-Agent');

  if (useragent && !isbot(useragent)) {
    return fetch(c.req.url);
  }

  const props = {
    name: 'KodaDot',
    siteData: {
      title: 'KodaDot - Your Generative Art Marketplace',
      description: 'One Stop NFT Shop on Polkadot',
      canonical: 'https://kodadot.xyz',
      image:
        'https://raw.githubusercontent.com/kodadot/nft-gallery/main/public/k_card.png', // change image url to bypass the cache
    },
  };

  return c.html(<Opengraph {...props} />);
});

app.on(['GET', 'HEAD'], '/:chain/:type/:id/*', async (c) => {
  const useragent = c.req.header('User-Agent');

  if (useragent && !isbot(useragent)) {
    return fetch(c.req.url);
  }

  const chain = c.req.param('chain');
  const id = c.req.param('id');
  const type = c.req.param('type');

  if (chains.includes(chain)) {
    if (['gallery', 'detail', 'collection', 'drops'].includes(type)) {
      return await ogiRequest(c.req.url, c.req.raw.headers);
    }

    if (type === 'u') {
      const props = await userDetail(chain, id);
      return c.html(<Opengraph {...props} />);
    }
  }

  return fetch(c.req.url);
});

app.on(['GET', 'HEAD'], '/blog/:slug', async (c) => {
  const useragent = c.req.header('User-Agent');
  const { slug } = c.req.param();

  if (useragent && !isbot(useragent)) {
    return fetch(c.req.url);
  }

  if (slug) {
    return await ogiRequest(c.req.url, c.req.raw.headers);
  }

  return fetch(c.req.url);
});

app.get('/sandbox.html', serveStatic({ path: './sandbox.html' }));

app.onError((err, c) => {
  console.error(`${err}`);
  return c.text(`path: ${c.req.url}`, 500);
});

export default app;
