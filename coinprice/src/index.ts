import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { cacheKey, getPrices } from './utils';

type Bindings = {
  coingecko: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

app.get('/', (c) => c.text('Hello Hono!'));

// return same format as coingecko https://api.coingecko.com/api/v3/simple/price?ids=kusama&vs_currencies=usd
const format = (chain: string, price: string) => {
  return {
    [chain]: {
      usd: parseFloat(price),
    },
  };
};

app.on(['GET', 'OPTIONS'], '/price/:chain', async (c) => {
  const { chain } = c.req.param();
  const key = `${cacheKey()}-${chain}`;
  const value = await c.env.coingecko.get(key);

  console.log(key, value);

  if (value === null) {
    try {
      const prices = await getPrices();

      const empty = { id: '', current_price: 0 };
      const price = prices.find((p) => p.id === chain) || empty;
      const usd = price.current_price.toString();
      c.executionCtx.waitUntil(c.env.coingecko.put(key, usd));

      console.log(chain, usd);

      return c.json(format(chain, usd));
    } catch (error) {
      console.log(error);
      return c.json({ error });
    }
  }

  return c.json(format(chain, value));
});

export default app;
