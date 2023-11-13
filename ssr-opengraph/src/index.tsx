import { Hono } from 'hono';
import isbot from 'isbot';

import { Opengraph } from './template';
import { galleryDetail, userDetail } from './handlers';

const app = new Hono();

const chains = ['bsx', 'snek', 'rmrk', 'ksm', 'ahp', 'ahk'];

app.get('/', async(c) => {
  const useragent = c.req.header('User-Agent')

  if (useragent && !isbot(useragent)) {
    return fetch(c.req.url);
  }

  const props = {
		name: 'KodaDot',
		siteData: {
			title: 'KodaDot - One Stop Shop for Polkadot NFTs',
			description: 'One Stop NFT Shop on Polkadot',
			canonical: 'https://kodadot.xyz',
			image: 'https://kodadot.xyz/k_card.png'
		}
  }

  return c.html(<Opengraph {...props} />);
})

app.get('/:chain/:type/:id/*', async (c) => {
  const useragent = c.req.header('User-Agent')

  if (useragent && !isbot(useragent)) {
    return fetch(c.req.url);
  }

  const chain = c.req.param('chain');
  const id = c.req.param('id');
  const type = c.req.param('type');

  if (chains.includes(chain)) {
    if (type === 'collection') {
      const url = new URL (c.req.url);
      const { pathname, search } = url;
      const opengraph = `https://ogi.kodadot.workers.dev/${pathname}${search}`

      const headers = new Headers(c.req.raw.headers);
      const request = new Request(opengraph, {
        headers
      })

      return await fetch(request)
    }

    if (type === 'gallery' || type === 'detail') {
      const props = await galleryDetail(chain, id);
      return c.html(<Opengraph {...props} />);
    }

    if (type === 'u') {
      const props = await userDetail(chain, id);
      return c.html(<Opengraph {...props} />);
    }
  }

  return fetch(c.req.url);
});

app.on(['HEAD'], '/:chain/:type/:id/*', async (c) => {
  return fetch(c.req.url);
});

app.onError((err, c) => {
  console.error(`${err}`);
  return c.text(`path: ${c.req.url}`, 500);
});

export default app;
