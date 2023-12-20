import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { cacheKey, getPrice, formatPrice, chainToken } from './utils';

type Bindings = {
  TOKENPRICE: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

app.get('/', (c) => c.text('Hello Hono!'));

app.on(['GET', 'OPTIONS'], '/price/:chain', async (c) => {
  const { chain } = c.req.param();
  const token = chain as keyof typeof chainToken;

  const key = `${cacheKey()}-${token}`;
  const value = await c.env.TOKENPRICE.get(key);
  const latestPrice = await c.env.TOKENPRICE.get(chain);

  console.log(key, value);

  if (value === null) {
    try {
      const usd = await getPrice(token);
      console.log(chain, usd);

      c.executionCtx.waitUntil(c.env.TOKENPRICE.put(key, usd));
      c.executionCtx.waitUntil(c.env.TOKENPRICE.put(chain, usd));

      return c.json(formatPrice(chain, usd));
    } catch (error) {
      console.log(error);

      if (latestPrice) {
        return c.json(formatPrice(chain, latestPrice));
      }

      return c.json({ error: (error as Error).message }, 500);
    }
  }

  return c.json(formatPrice(chain, value));
});

export default app;
