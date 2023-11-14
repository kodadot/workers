import { Hono } from 'hono';
import isbot from 'isbot';

import { Opengraph } from './template';
import { userDetail } from './handlers';
import { ogiRequest } from './utils';

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
      return await ogiRequest(c.req.url, c.req.raw.headers)
    }

    if (type === 'gallery' || type === 'detail') {
      return await ogiRequest(c.req.url, c.req.raw.headers)
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
