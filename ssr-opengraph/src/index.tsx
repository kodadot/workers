import { Hono } from 'hono';
import isbot from 'isbot';

import { Opengraph } from './template';
import { collectionDetail, galleryDetail, userDetail } from './handlers';

const app = new Hono();

const chains = ['bsx', 'snek', 'rmrk', 'ksm', 'ahp', 'ahk'];

app.get('/', async(c) => {
  const useragent = c.req.headers.get('user-agent');

  if (useragent && !isbot(useragent)) {
    return fetch(c.req.url);
  }

  const props = {
    name: 'KodaDot',
    siteData: {
      title: 'KodaDot - Go To Polkadot NFT marketplace',
      description: 'Multi-chain NFT marketplace across Polkadot parachains',
      canonical: 'https://kodadot.xyz',
      image: 'https://kodadot.xyz/k_card.png',
    }
  }

  return c.html(<Opengraph {...props} />);
})

app.get('/:chain/:type/:id/*', async (c) => {
  const useragent = c.req.headers.get('user-agent');

  if (useragent && !isbot(useragent)) {
    return fetch(c.req.url);
  }

  const chain = c.req.param('chain');
  const id = c.req.param('id');
  const type = c.req.param('type');

  if (chains.includes(chain)) {
    if (type === 'gallery' || type === 'detail') {
      const props = await galleryDetail(chain, id);
      return c.html(<Opengraph {...props} />);
    }

    if (type === 'collection') {
      const props = await collectionDetail(chain, id);
      return c.html(<Opengraph {...props} />);
    }

    if (type === 'u') {
      const props = await userDetail(chain, id);
      return c.html(<Opengraph {...props} />);
    }
  }

  return fetch(c.req.url);
});

app.head('/:chain/:type/:id/*', async (c) => {
  return fetch(c.req.url);
});

app.onError((err, c) => {
  console.error(`${err}`);
  return c.text(`path: ${c.req.url}`, 500);
});

export default app;
