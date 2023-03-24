import { Hono } from 'hono';
import isbot from 'isbot';
import { Opengraph } from './template';
import {
  formatPrice,
  getCollectionById,
  getItemListByCollectionId,
  getNftById,
  getProperties,
} from './utils';

import type { Chains } from './utils';
import type { CollectionEntity, ListEntity, NFTEntity } from './types';

const app = new Hono();

app.get('/', (c) => {
  return c.text('hello hono.js');
});

const chains = ['bsx', 'snek', 'rmrk'];

app.get('/:chain/gallery/:id', async (c) => {
  const useragent = c.req.headers.get('user-agent');

  if (useragent && !isbot(useragent)) {
    return fetch(c.req.url);
  }

  const chain = c.req.param('chain');
  const id = c.req.param('id');

  if (chains.includes(chain)) {
    const response = await getNftById(chain as Chains, id);
    const data = response as NFTEntity;
    const { item } = data.data;

    const canonical = `https://kodadot.xyz/${chain}/gallery/${id}`;
    const { name, description, title, cdn } = await getProperties(item);

    // contruct price
    const price = formatPrice(item.price || '0');

    // construct vercel image with cdn
    const image = new URL(
      `https://og-image-green-seven.vercel.app/${name}.jpeg`
    );
    image.searchParams.set('price', price);
    image.searchParams.set('image', cdn);

    const props = {
      name: `${chain} ${id}`,
      siteData: {
        title,
        description: description,
        canonical,
        image: image.toString(),
      },
    };

    return c.html(<Opengraph {...props} />);
  }

  return fetch(c.req.url);
});

app.get('/:chain/collection/:id', async (c) => {
  const useragent = c.req.headers.get('user-agent');

  if (useragent && !isbot(useragent)) {
    return fetch(c.req.url);
  }

  const chain = c.req.param('chain');
  const id = c.req.param('id');

  if (chains.includes(chain)) {
    const [collectionItem, nfts] = await Promise.all([
      getCollectionById(chain as Chains, id),
      getItemListByCollectionId(chain as Chains, id),
    ]);
    const { collection } = (collectionItem as CollectionEntity).data;

    const canonical = `https://kodadot.xyz/${chain}/gallery/${id}`;
    const { name, description, title, cdn } = await getProperties(collection);

    const price = (nfts as ListEntity).data.items.length || 0;

    // construct vercel image with cdn
    const image = new URL(
      `https://og-image-green-seven.vercel.app/${name}.jpeg`
    );
    image.searchParams.set('price', `Items: ${price}`);
    image.searchParams.set('image', cdn);

    const props = {
      name: `${chain} ${id}`,
      siteData: {
        title,
        description: description,
        canonical,
        image: image.toString(),
      },
    };

    return c.html(<Opengraph {...props} />);
  }

  return fetch(c.req.url);
});

export default app;
