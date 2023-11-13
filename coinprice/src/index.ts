import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { cacheKey, getPrices, formatPrice } from './utils';

type Bindings = {
  TOKENPRICE: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

app.get('/', (c) => c.text('Hello Hono!'));

app.on(['GET', 'OPTIONS'], '/price/:chain', async (c) => {
  const { chain } = c.req.param();
  const key = `${cacheKey()}-${chain}`;
  const value = await c.env.TOKENPRICE.get(key);

  console.log(key, value);

  if (value === null) {
    try {
      const prices = await getPrices();

      const empty = { id: '', current_price: 0 };
      const price = prices.find((p) => p.id === chain) || empty;
      const usd = price.current_price.toString();
      c.executionCtx.waitUntil(c.env.TOKENPRICE.put(key, usd));

      console.log(chain, usd);

      return c.json(formatPrice(chain, usd));
    } catch (error) {
      console.log(error);
      return c.json({ error });
    }
  }

  return c.json(formatPrice(chain, value));
});

export default app;
